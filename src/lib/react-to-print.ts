import * as reactToPrint from "react-to-print";

/**
 * react-to-print only ships a CommonJS build, so during SSR Vite can't see its
 * named exports and the hook arrives on the CommonJS `default` instead. Resolve
 * it from either place so server and browser both get the real hook.
 */
type ReactToPrintModule = typeof reactToPrint & { default?: typeof reactToPrint };
const mod = reactToPrint as ReactToPrintModule;

export const useReactToPrint: typeof reactToPrint.useReactToPrint =
  mod.useReactToPrint ?? mod.default!.useReactToPrint;
