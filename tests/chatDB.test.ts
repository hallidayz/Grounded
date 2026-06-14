
import "./setup"; // Contains other polyfills
import { chatDB, db, type ChatMessage } from "../src/services/chatDB";

describe("chatDB", () => {
  beforeEach(async () => {
    // Clear the database before each test to ensure isolation
    await db.sessions.clear();
  });

  it("should have an empty database initially", async () => {
    const count = await chatDB.getSessionCount();
    expect(count).toBe(0);
  });
});

describe("Core Functions", () => {
  beforeEach(async () => {
    await db.sessions.clear();
  });
    it("saveSession should save a session with default values", async () => {
      const messages: ChatMessage[] = [
        { role: "user", content: "Hello AI", timestamp: Date.now() },
        { role: "assistant", content: "Hello User", timestamp: Date.now() }
      ];

      const sessionId = await chatDB.saveSession(messages);
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe("string");

      const session = await chatDB.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
      expect(session?.title).toBe("Hello AI"); // Default title is derived from first message content
      expect(session?.energy).toBeUndefined();
      expect(session?.messages).toHaveLength(2);
      expect(session?.messages[0].content).toBe("Hello AI");
      expect(session?.createdAt).toBeDefined();
      expect(session?.updatedAt).toBe(session?.createdAt);
    });

    it("saveSession should save a session with custom values", async () => {
      const messages: ChatMessage[] = [
        { role: "user", content: "Test message", timestamp: Date.now() }
      ];

      const sessionId = await chatDB.saveSession(messages, "High", "My Custom Title");
      const session = await chatDB.getSession(sessionId);

      expect(session?.title).toBe("My Custom Title");
      expect(session?.energy).toBe("High");
    });

    it("updateSession should update messages and updatedAt", async () => {
      const initialMessages: ChatMessage[] = [
        { role: "user", content: "Hello", timestamp: Date.now() }
      ];
      const sessionId = await chatDB.saveSession(initialMessages);
      const initialSession = await chatDB.getSession(sessionId);
      const initialUpdatedAt = initialSession!.updatedAt;

      // Delay to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      const newMessages: ChatMessage[] = [
        ...initialMessages,
        { role: "assistant", content: "Hi there", timestamp: Date.now() }
      ];

      await chatDB.updateSession(sessionId, newMessages);

      const updatedSession = await chatDB.getSession(sessionId);
      expect(updatedSession?.messages).toHaveLength(2);
      expect(updatedSession?.messages[1].content).toBe("Hi there");
      expect(updatedSession!.updatedAt).toBeGreaterThan(initialUpdatedAt);
    });

    it("getSession should return undefined for non-existent session", async () => {
      const session = await chatDB.getSession("invalid-id");
      expect(session).toBeUndefined();
    });
  });

describe("Listing and Utility Functions", () => {
  beforeEach(async () => {
    await db.sessions.clear();
  });

  it("getAllSessions should return sessions ordered by createdAt reverse", async () => {
    const msg1: ChatMessage[] = [{ role: "user", content: "First", timestamp: Date.now() }];
    const msg2: ChatMessage[] = [{ role: "user", content: "Second", timestamp: Date.now() }];

    await chatDB.saveSession(msg1);
    // Delay to guarantee different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    await chatDB.saveSession(msg2);

    const sessions = await chatDB.getAllSessions();
    expect(sessions).toHaveLength(2);
    // Newest first
    expect(sessions[0].messages[0].content).toBe("Second");
    expect(sessions[1].messages[0].content).toBe("First");
  });

  it("getSessionsByDate should return sessions for a specific date", async () => {
    const msg: ChatMessage[] = [{ role: "user", content: "Test", timestamp: Date.now() }];
    const sessionId = await chatDB.saveSession(msg);
    const session = await chatDB.getSession(sessionId);

    // We mock the date string to simulate past sessions, but for simplicity let's test the current date
    const dateString = session!.dateString;
    const sessions = await chatDB.getSessionsByDate(dateString);

    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe(sessionId);

    const noSessions = await chatDB.getSessionsByDate("2000-01-01");
    expect(noSessions).toHaveLength(0);
  });

  it("getDatesWithSessions should return unique dates sorted reverse", async () => {
    const msg: ChatMessage[] = [{ role: "user", content: "Test", timestamp: Date.now() }];

    // Create a normal session
    await chatDB.saveSession(msg);

    // Manually create a session in the past
    const pastSession = {
      id: "past-id",
      title: "Past",
      messages: [],
      createdAt: Date.now() - 100000,
      updatedAt: Date.now() - 100000,
      dateString: "2023-01-01",
      timeString: "12:00"
    };
    await db.sessions.put(pastSession);

    // Get the dynamic today date string from the current session
    const currentSessions = await chatDB.getAllSessions();
    const todayStr = currentSessions.find(s => s.id !== "past-id")!.dateString;

    const dates = await chatDB.getDatesWithSessions();
    expect(dates).toHaveLength(2);
    expect(dates[0]).toBe(todayStr); // Today string should be greater than "2023-01-01"
    expect(dates[1]).toBe("2023-01-01");
  });

  it("deleteSession should remove a specific session", async () => {
    const msg: ChatMessage[] = [{ role: "user", content: "Test", timestamp: Date.now() }];
    const sessionId = await chatDB.saveSession(msg);

    expect(await chatDB.getSessionCount()).toBe(1);

    await chatDB.deleteSession(sessionId);

    expect(await chatDB.getSessionCount()).toBe(0);
    expect(await chatDB.getSession(sessionId)).toBeUndefined();
  });

  it("clearAllSessions should remove all sessions", async () => {
    const msg: ChatMessage[] = [{ role: "user", content: "Test", timestamp: Date.now() }];
    await chatDB.saveSession(msg);
    await chatDB.saveSession(msg);

    expect(await chatDB.getSessionCount()).toBe(2);

    await chatDB.clearAllSessions();

    expect(await chatDB.getSessionCount()).toBe(0);
  });

  it("getSessionCount should return correct count", async () => {
    expect(await chatDB.getSessionCount()).toBe(0);

    const msg: ChatMessage[] = [{ role: "user", content: "Test", timestamp: Date.now() }];
    await chatDB.saveSession(msg);
    expect(await chatDB.getSessionCount()).toBe(1);

    await chatDB.saveSession(msg);
    expect(await chatDB.getSessionCount()).toBe(2);
  });
});


describe("Export and Share Functions", () => {
  beforeEach(async () => {
    await db.sessions.clear();
  });

  it("exportSession should return a formatted JSON string", async () => {
    const now = Date.now();
    const msg: ChatMessage[] = [{ role: "user", content: "Test Export", timestamp: now }];
    const sessionId = await chatDB.saveSession(msg);

    const exportStr = await chatDB.exportSession(sessionId);
    expect(typeof exportStr).toBe("string");

    const exportData = JSON.parse(exportStr);
    expect(exportData.title).toBe("Test Export");
    expect(exportData.messages).toHaveLength(1);
    expect(exportData.messages[0].content).toBe("Test Export");
    expect(exportData.messages[0].timestamp).toBe(new Date(now).toISOString());
  });

  it("exportSession should throw an error for non-existent session", async () => {
    expect(chatDB.exportSession("invalid-id")).rejects.toThrow("Session not found");
  });

  it("shareSession should use navigator.share if available", async () => {
    const msg: ChatMessage[] = [{ role: "user", content: "Share me", timestamp: Date.now() }];
    const sessionId = await chatDB.saveSession(msg);
    const session = await chatDB.getSession(sessionId);

    const originalNavigator = global.navigator;
    const mockShare = jest.fn(async () => {});

    // @ts-ignore - Mocking global navigator
    global.navigator = { share: mockShare };

    await chatDB.shareSession(sessionId);

    expect(mockShare).toHaveBeenCalled();
    const shareCallArgs = mockShare.mock.calls[0][0];
    expect(shareCallArgs.title).toBe(session!.title);
    expect(shareCallArgs.text).toContain(`Grounded Chat - ${session!.dateString} ${session!.timeString}`);
    expect(shareCallArgs.text).toContain("You: Share me");

    // Restore navigator
    global.navigator = originalNavigator;
  });

  it("shareSession should fallback to clipboard and throw if share is not available", async () => {
    const msg: ChatMessage[] = [{ role: "assistant", content: "AI says hi", timestamp: Date.now() }];
    const sessionId = await chatDB.saveSession(msg);

    const originalNavigator = global.navigator;
    const mockWriteText = jest.fn(async () => {});

    // @ts-ignore - Mocking global navigator
    global.navigator = { clipboard: { writeText: mockWriteText } };

    // Expect it to throw the success message as an error (per implementation)
    expect(chatDB.shareSession(sessionId)).rejects.toThrow("Copied to clipboard");

    // Check that writeText was called
    // We need to wait a tick for the rejected promise before we can check the mock
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockWriteText).toHaveBeenCalled();
    const clipboardArgs = mockWriteText.mock.calls[0][0];
    expect(clipboardArgs).toContain("AI: AI says hi");

    // Restore navigator
    global.navigator = originalNavigator;
  });

  it("shareSession should throw an error for non-existent session", async () => {
    expect(chatDB.shareSession("invalid-id")).rejects.toThrow("Session not found");
  });
});
