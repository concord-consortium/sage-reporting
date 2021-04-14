# sage-reporting
Tool for education researchers to report on Sage Modeler diagram topology.

## How to run this:
1. Clone this repo: `git clone git@github.com:concord-consortium/sage-reporting.git sage-reporting`
2. Make sure you have [npm & node installed](https://www.npmjs.com/get-npm).
2. Install node dependencies `npm install`
3. Place your reporting sources (`*/.xlsx`) into the `input` folder here.
4. run `npm run convert`
5. output CSV files will appear in the `output` directory here.
6. you can also try running it from github pages; https://concord-consortium.github.io/sage-reporting/

## How to develop:
1. Follow the above instructions.
1. Then run `npm run start`, and work on files in `./src/*.ts`

## Reference Material

* [Sage Modeler topology tagger code](https://github.com/concord-consortium/building-models/blob/master/src/code/utils/topology-tagger.ts)
* [XLSX processing npm module](https://www.npmjs.com/package/xlsx)
* [XLSX parsing options](https://www.npmjs.com/package/xlsx#parsing-options)
* [CVS Parse npm](https://www.npmjs.com/package/csv-parse)
* [CVS Parse docs](https://csv.js.org/parse/)

