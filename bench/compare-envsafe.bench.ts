// Benchmark: head-to-head vs envsafe (KATT) with identical schemas
import { Bench } from "tinybench"

const bench = new Bench({ time: 1000 })

// TODO: implement benchmark (requires envsafe as devDep)

bench.run().then(() => {
  console.table(bench.table())
})
