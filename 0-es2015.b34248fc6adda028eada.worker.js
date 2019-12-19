!function(modules){var installedModules={};function __webpack_require__(moduleId){if(installedModules[moduleId])return installedModules[moduleId].exports;var module=installedModules[moduleId]={i:moduleId,l:!1,exports:{}};return modules[moduleId].call(module.exports,module,module.exports,__webpack_require__),module.l=!0,module.exports}__webpack_require__.m=modules,__webpack_require__.c=installedModules,__webpack_require__.d=function(exports,name,getter){__webpack_require__.o(exports,name)||Object.defineProperty(exports,name,{enumerable:!0,get:getter})},__webpack_require__.r=function(exports){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(exports,"__esModule",{value:!0})},__webpack_require__.t=function(value,mode){if(1&mode&&(value=__webpack_require__(value)),8&mode)return value;if(4&mode&&"object"==typeof value&&value&&value.__esModule)return value;var ns=Object.create(null);if(__webpack_require__.r(ns),Object.defineProperty(ns,"default",{enumerable:!0,value:value}),2&mode&&"string"!=typeof value)for(var key in value)__webpack_require__.d(ns,key,(function(key){return value[key]}).bind(null,key));return ns},__webpack_require__.n=function(module){var getter=module&&module.__esModule?function(){return module.default}:function(){return module};return __webpack_require__.d(getter,"a",getter),getter},__webpack_require__.o=function(object,property){return Object.prototype.hasOwnProperty.call(object,property)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s="zti0")}({zti0:function(module,__webpack_exports__,__webpack_require__){"use strict";function __awaiter(thisArg,_arguments,P,generator){return new(P||(P=Promise))((function(resolve,reject){function fulfilled(value){try{step(generator.next(value))}catch(e){reject(e)}}function rejected(value){try{step(generator.throw(value))}catch(e){reject(e)}}function step(result){result.done?resolve(result.value):new P((function(resolve){resolve(result.value)})).then(fulfilled,rejected)}step((generator=generator.apply(thisArg,_arguments||[])).next())}))}__webpack_require__.r(__webpack_exports__);const instanceOfAny=(object,constructors)=>constructors.some(c=>object instanceof c);let idbProxyableTypes,cursorAdvanceMethods;const cursorRequestMap=new WeakMap,transactionDoneMap=new WeakMap,transactionStoreNamesMap=new WeakMap,transformCache=new WeakMap,reverseTransformCache=new WeakMap;let idbProxyTraps={get(target,prop,receiver){if(target instanceof IDBTransaction){if("done"===prop)return transactionDoneMap.get(target);if("objectStoreNames"===prop)return target.objectStoreNames||transactionStoreNamesMap.get(target);if("store"===prop)return receiver.objectStoreNames[1]?void 0:receiver.objectStore(receiver.objectStoreNames[0])}return wrap(target[prop])},has:(target,prop)=>target instanceof IDBTransaction&&("done"===prop||"store"===prop)||prop in target};function wrap(value){if(value instanceof IDBRequest)return function(request){const promise=new Promise((resolve,reject)=>{const unlisten=()=>{request.removeEventListener("success",success),request.removeEventListener("error",error)},success=()=>{resolve(wrap(request.result)),unlisten()},error=()=>{reject(request.error),unlisten()};request.addEventListener("success",success),request.addEventListener("error",error)});return promise.then(value=>{value instanceof IDBCursor&&cursorRequestMap.set(value,request)}).catch(()=>{}),reverseTransformCache.set(promise,request),promise}(value);if(transformCache.has(value))return transformCache.get(value);const newValue=function(value){return"function"==typeof value?(func=value)!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(cursorAdvanceMethods||(cursorAdvanceMethods=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(func)?function(...args){return func.apply(unwrap(this),args),wrap(cursorRequestMap.get(this))}:function(...args){return wrap(func.apply(unwrap(this),args))}:function(storeNames,...args){const tx=func.call(unwrap(this),storeNames,...args);return transactionStoreNamesMap.set(tx,storeNames.sort?storeNames.sort():[storeNames]),wrap(tx)}:(value instanceof IDBTransaction&&function(tx){if(transactionDoneMap.has(tx))return;const done=new Promise((resolve,reject)=>{const unlisten=()=>{tx.removeEventListener("complete",complete),tx.removeEventListener("error",error),tx.removeEventListener("abort",error)},complete=()=>{resolve(),unlisten()},error=()=>{reject(tx.error),unlisten()};tx.addEventListener("complete",complete),tx.addEventListener("error",error),tx.addEventListener("abort",error)});transactionDoneMap.set(tx,done)}(value),instanceOfAny(value,idbProxyableTypes||(idbProxyableTypes=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction]))?new Proxy(value,idbProxyTraps):value);var func}(value);return newValue!==value&&(transformCache.set(value,newValue),reverseTransformCache.set(newValue,value)),newValue}const unwrap=value=>reverseTransformCache.get(value),readMethods=["get","getKey","getAll","getAllKeys","count"],writeMethods=["put","add","delete","clear"],cachedMethods=new Map;function getMethod(target,prop){if(!(target instanceof IDBDatabase)||prop in target||"string"!=typeof prop)return;if(cachedMethods.get(prop))return cachedMethods.get(prop);const targetFuncName=prop.replace(/FromIndex$/,""),useIndex=prop!==targetFuncName,isWrite=writeMethods.includes(targetFuncName);if(!(targetFuncName in(useIndex?IDBIndex:IDBObjectStore).prototype)||!isWrite&&!readMethods.includes(targetFuncName))return;const method=async function(storeName,...args){const tx=this.transaction(storeName,isWrite?"readwrite":"readonly");let target=tx.store;useIndex&&(target=target.index(args.shift()));const returnVal=target[targetFuncName](...args);return isWrite&&await tx.done,returnVal};return cachedMethods.set(prop,method),method}idbProxyTraps=(oldTraps=>({get:(target,prop,receiver)=>getMethod(target,prop)||oldTraps.get(target,prop,receiver),has:(target,prop)=>!!getMethod(target,prop)||oldTraps.has(target,prop)}))(idbProxyTraps);var Action=function(Action){return Action.put="put",Action.get="get",Action.delete="delete",Action}({});function awaitWrap(promise){return __awaiter(this,void 0,void 0,(function*(){try{return[void 0,yield promise]}catch(e){return[e]}}))}const getDb=(()=>{let deferred;return()=>__awaiter(void 0,void 0,void 0,(function*(){if(deferred)return deferred.promise;deferred=function(){let resolve,reject;const promise=new Promise((rs,rj)=>{resolve=rs,reject=rj});return{resolve:resolve,reject:reject,promise:promise}}();const[err,data]=yield awaitWrap(function(name,version,{blocked:blocked,upgrade:upgrade,blocking:blocking}={}){const request=indexedDB.open(name,version),openPromise=wrap(request);return upgrade&&request.addEventListener("upgradeneeded",event=>{upgrade(wrap(request.result),event.oldVersion,event.newVersion,wrap(request.transaction))}),blocked&&request.addEventListener("blocked",()=>blocked()),blocking&&openPromise.then(db=>db.addEventListener("versionchange",blocking)).catch(()=>{}),openPromise}("music",1,{upgrade(db){db.createObjectStore("music-structured")}}));return data?deferred.resolve(data):deferred.reject(err),deferred.promise}))})();addEventListener("message",({data:data})=>__awaiter(void 0,void 0,void 0,(function*(){const{uuid:uuid}=data;if(!uuid)return void console.warn("no uuid, ignore action",data);const store=yield function(){return __awaiter(this,void 0,void 0,(function*(){return(yield getDb()).transaction(["music-structured"],"readwrite").objectStore("music-structured")}))}(),[err,result]=yield awaitWrap(function({store:store,action:action,key:key,value:value}){return __awaiter(this,void 0,void 0,(function*(){if(action===Action.put){if(!value)throw new Error("store put not set value");return store.put(value,key)}if(action===Action.get)return store.get(key);if(action===Action.delete)return store.delete(key);throw new Error(`action:${action} not support`)}))}(Object.assign({store:store},data)));let errorMessage;err&&(console.warn(err,"set store failed"),errorMessage=err.message),postMessage({uuid:uuid,result:result,errMsg:errorMessage})})))}});