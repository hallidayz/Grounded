import "./react-vendor-DI6xFhD6.js";
import "./ai-services-COb65xmG.js";
import "./index-WfZz5ZRF.js";
import "./vendor-Dvad8g1z.js";
import "./db-vendor-CqkAjsCZ.js";
import "./animations-DuiRUzrK.js";
import "./transformers-DYceLRQ3.js";
import "./onnx-eBVVFwq3.js";
const INIT_STARTED_KEY = "app_init_started";
const INIT_STARTED_TIME_KEY = "app_init_started_time";
const INIT_COMPLETE_KEY = "app_init_complete";
function setInitializationStarted(value) {
  if (typeof sessionStorage !== "undefined") {
    {
      sessionStorage.removeItem(INIT_STARTED_KEY);
      sessionStorage.removeItem(INIT_STARTED_TIME_KEY);
    }
  }
}
function setInitializationComplete(value) {
  if (typeof sessionStorage !== "undefined") {
    {
      sessionStorage.removeItem(INIT_COMPLETE_KEY);
    }
  }
}
function resetInitialization() {
  setInitializationStarted();
  setInitializationComplete();
}
export {
  resetInitialization
};
