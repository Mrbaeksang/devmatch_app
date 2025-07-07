index.js:640 Uncaught Error: Module not found: Can't resolve 'class-variance-authority'
  1 | import * as React from "react"
  2 | import { Slot } from "@radix-ui/react-slot"
> 3 | import { cva, type VariantProps } from "class-variance-authority"
    | ^
  4 |
  5 | import { cn } from "@/lib/utils"
  6 |

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./app/projects/page.tsx
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at getNotFoundError (file://C:\Users\qortk\IdeaProjects\devmatch-app\node_modules\.pnpm\next@15.3.5_react-dom@19.1.0_react@19.1.0__react@19.1.0\node_modules\next\dist\build\webpack\plugins\wellknown-errors-plugin\parseNotFoundError.js:135:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async getModuleBuildError (file://C:\Users\qortk\IdeaProjects\devmatch-app\node_modules\.pnpm\next@15.3.5_react-dom@19.1.0_react@19.1.0__react@19.1.0\node_modules\next\dist\build\webpack\plugins\wellknown-errors-plugin\webpackModuleError.js:103:27)
    at async (file://C:\Users\qortk\IdeaProjects\devmatch-app\node_modules\.pnpm\next@15.3.5_react-dom@19.1.0_react@19.1.0__react@19.1.0\node_modules\next\dist\build\webpack\plugins\wellknown-errors-plugin\index.js:29:49)
    at async (file://C:\Users\qortk\IdeaProjects\devmatch-app\node_modules\.pnpm\next@15.3.5_react-dom@19.1.0_react@19.1.0__react@19.1.0\node_modules\next\dist\build\webpack\plugins\wellknown-errors-plugin\index.js:27:21)
websocket.js:42 [HMR] connected
hook.js:608 ./components/ui/button.tsx:3:1
Module not found: Can't resolve 'class-variance-authority'
  1 | import * as React from "react"
  2 | import { Slot } from "@radix-ui/react-slot"
> 3 | import { cva, type VariantProps } from "class-variance-authority"
    | ^
  4 |
  5 | import { cn } from "@/lib/utils"
  6 |

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./app/projects/page.tsx
overrideMethod @ hook.js:608
hook.js:608 ./components/ui/dialog.tsx:5:1
Module not found: Can't resolve 'lucide-react'
  3 | import * as React from "react"
  4 | import * as DialogPrimitive from "@radix-ui/react-dialog"
> 5 | import { XIcon } from "lucide-react"
    | ^
  6 |
  7 | import { cn } from "@/lib/utils"
  8 |

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./app/projects/page.tsx
overrideMethod @ hook.js:608
