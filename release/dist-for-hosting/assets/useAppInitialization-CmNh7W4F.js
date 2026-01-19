import "./react-vendor-BgnRdV3Y.js";
import "./ai-services-DJUX-74P.js";
import "./vendor-BKChQSPc.js";
import "./db-vendor-CqkAjsCZ.js";
import "./transformers-CdMs_eeA.js";
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
