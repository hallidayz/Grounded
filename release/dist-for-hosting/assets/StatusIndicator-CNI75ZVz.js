var n=Object.defineProperty;var l=(t,e)=>n(t,"name",{value:e,configurable:!0});import{j as a}from"./react-vendor-ByHOp49b.js";const u=l(({status:t,label:e,size:o="md",className:r=""})=>{const i={sm:"w-2 h-2",md:"w-2.5 h-2.5",lg:"w-3 h-3"},s={"not-done":{dot:"bg-red-500",pulse:!1,ariaLabel:"Not processed"},processing:{dot:"bg-yellow-500",pulse:!0,ariaLabel:"Processing"},complete:{dot:"bg-green-500",pulse:!1,ariaLabel:"Complete"}}[t];return a.jsxs("div",{className:`flex items-center gap-1.5 ${r}`,children:[a.jsx("div",{className:`
          ${i[o]} 
          ${s.dot} 
          rounded-full 
          ${s.pulse?"animate-pulse":""}
        `,role:"status","aria-label":s.ariaLabel,title:s.ariaLabel}),e&&a.jsx("span",{className:"text-xs text-text-secondary dark:text-white/60",children:e})]})},"StatusIndicator");export{u as S};
