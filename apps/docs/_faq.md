Collection of frequently asked questions with ideas on how to troubleshoot and resolve them.

## I am getting `is not a function` errors

This error often occurs when multiple conflicting versions of ReactiveDOT are installed. To resolve this, try the following steps:

1. **Clean and reinstall dependencies:**  
   Delete your `node_modules` folder and reinstall dependencies. You can do this manually or use [npkill](https://npkill.js.org/):

   ```sh
   npx npkill
   ```

2. **Deduplicate dependencies (Yarn users):**  
   Yarn does not deduplicate dependencies by default and may create duplicates when updating packages. To fix this, run [yarn dedupe](https://yarnpkg.com/cli/dedupe):

   ```sh
   yarn dedupe "@reactive-dot/*"
   ```
