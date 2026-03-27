// Benchmark: parse 10K env objects with 10 validators each
// Target: < 5ms
import { Bench } from "tinybench"

const bench = new Bench({ time: 1000 })

// TODO: implement benchmark

bench.run().then(() => {
  console.table(bench.table())
})
