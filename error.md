Message: Error in Prisma Client request: 


Invalid `STUDIO_EMBED_BUILD<"u"&&STUDIO_EMBED_BUILD?q4e():require(`${l.prismaClient}/runtime/${c}`),F=r,I=(0,fz.createHash)("sha256").update()` invocation in
C:\Users\qortk\IdeaProjects\devmatch-app\node_modules\.pnpm\prisma@6.11.1_typescript@5.8.3\node_modules\prisma\build\index.js:4822:10635

  4819       }
  4820     }
  4821   }
→ 4822 `}}),i=n.workspaces.find(a=>a.isDefault);if(!i)throw new Error("No default workspace found");return i};var rNe=require("@prisma/engines");var IOe=require("buffer");function $Oe(r,e,n,i){Object.defineProperty(r,e,{get:n,set:i,enumerable:!0,configurable:!0})}var MOe={};$Oe(MOe,"serializeRPCMessage",()=>dV);$Oe(MOe,"deserializeRPCMessage",()=>fV);var lV="PrismaBigInt::",pV="PrismaBytes::";function dV(r){return JSON.stringify(r,(e,n)=>typeof n=="bigint"?lV+n:n?.type==="Buffer"&&Array.isArray(n?.data)?pV+IOe.Buffer.from(n.data).toString("base64"):n)}function fV(r){return JSON.parse(r,(e,n)=>typeof n=="string"&&n.startsWith(lV)?BigInt(n.substr(lV.length)):typeof n=="string"&&n.startsWith(pV)?n.substr(pV.length):n)}var K4e=G(UOe()),O$=G(YMe()),J4e=G(require("http")),Y4e=G(ZMe()),Q4e=require("zlib");var xm=require("path");var fz=require("crypto"),G4e=require("fs/promises"),W4e=G(gH());function pz(r,e,n,i){Object.defineProperty(r,e,{get:n,set:i,enumerable:!0,configurable:!0})}var V4e=globalThis,cz={},R$={},zg=V4e.parcelRequire94c2;zg==null&&(zg=function(r){if(r in cz)return cz[r].exports;if(r in R$){var e=R$[r];delete R$[r];var n={id:r,exports:{}};return cz[r]=n,e.call(n.exports,n,n.exports),n.exports}var i=new Error("Cannot find module '"+r+"'");throw i.code="MODULE_NOT_FOUND",i},zg.register=function(e,n){R$[e]=n},V4e.parcelRequire94c2=zg);var H4e=zg.register;H4e("9lTzd",function(module,exports){pz(module.exports,"guessEnginePaths",()=>guessEnginePaths),pz(module.exports,"guessPrismaClientPath",()=>guessPrismaClientPath);var $5COlq=zg("5COlq");async function guessEnginePaths({forceBinary,forceLibrary,resolveOverrides}){let queryEngineName,queryEngineType;if(forceLibrary?(queryEngineName=await(0,$5COlq.prismaEngineName)("query-engine","library"),queryEngineType="library"):forceBinary?(queryEngineName=await(0,$5COlq.prismaEngineName)("query-engine","binary"),queryEngineType="binary"):(queryEngineName=void 0,queryEngineType=void 0),!queryEngineName||!queryEngineType)return{queryEngine:void 0};let queryEnginePath;if(resolveOverrides[".prisma/client"])queryEnginePath=(0,xm.resolve)(resolveOverrides[".prisma/client"],`../${queryEngineName}`);else if(resolveOverrides["@prisma/engines"])queryEnginePath=(0,xm.resolve)(resolveOverrides["@prisma/engines"],`../../${queryEngineName}`);else{let atPrismaEnginesPath;try{atPrismaEnginesPath=eval("require.resolve('@prisma/engines')")}catch(r){throw new Error("Unable to resolve Prisma engine paths. This is a bug.")}queryEnginePath=(0,xm.resolve)(atPrismaEnginesPath`../../${queryEngineName}`)}return{queryEngine:{type:queryEngineType,path:queryEnginePath}}}function guessPrismaClientPath({resolveOverrides}){let prismaClientPath=resolveOverrides["@prisma/client"]||eval("require.resolve('@prisma/client')");return(0,xm.resolve)(prismaClientPath,"../")}});H4e("5COlq",function(r,e){pz(r.exports,"prismaEngineName",()=>n);async function n(i,a){let o=await ji(),u=o==="windows"?".exe":"";if(a==="library")return _a(o,"fs");if(a==="binary")return`${i}-${o}${u}`;throw new Error(`Unknown engine type: ${a}`)}});function ILt(r){return{models:lz(r.models),enums:lz(r.enums),types:lz(r.types)}}function lz(r){let e={};for(let{name:n,...i}of r)e[n]=i;return e}var HD=(0,W4e.debug)("prisma:studio-pcw"),$Lt=/^\s*datasource\s+([^\s]+)\s*{/m,MLt=/url *= *env\("(.*)"\)/,kLt=/url *= *"(.*)"/;async function NLt({schema:r,schemaPath:e,dmmf:n,adapter:i,datasourceProvider:a,previewFeatures:o,datasources:u,engineType:c,paths:l,directUrl:p,versions:f}){let g=r.match($Lt)?.[1]??"",v=r.match(MLt)?.[1]??null,x=r.match(kLt)?.[1]??null,{getPrismaClient:b,PrismaClientKnownRequestError:E,PrismaClientRustPanicError:_,PrismaClientInitializationError:T,PrismaClientValidationError:A}=typeof STUDIO_EMBED_BUILD<"u"&&STUDIO_EMBED_BUILD?q4e():require(`${l.prismaClient}/runtime/${c}`),F=r,I=(0,fz.createHash)("sha256").update(
Value 'INITIAL_CONSULTATION' not found in enum 'ProjectStatus'
  
Query:
{
  "modelName": "Project",
  "operation": "findMany",
  "args": {
    "take": 100,
    "skip": 0,
    "select": {
      "id": true,
      "name": true,
      "goal": true,
      "createdAt": true,
      "updatedAt": true,
      "ownerId": true,
      "owner": true,
      "status": true,
      "consultationData": true,
      "members": {
        "select": {
          "id": true
        }
      },
      "roles": {
        "select": {
          "id": true
        }
      },
      "inviteLinks": {
        "select": {
          "id": true
        }
      },
      "chatMessages": {
        "select": {
          "id": true
        }
      },
      "recommendedRoles": {
        "select": {
          "id": true
        }
      }
    }
  }
}
  