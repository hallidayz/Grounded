import { generateId } from './src/services/energyTrackingService.ts';

console.log("Testing generateId()...");
const id1 = generateId();
const id2 = generateId('test');

console.log("ID 1:", id1);
console.log("ID 2:", id2);

if (id1.startsWith('energy_') && id1 !== id2) {
    console.log("generateId works correctly.");
} else {
    console.error("generateId failed.");
    process.exit(1);
}
