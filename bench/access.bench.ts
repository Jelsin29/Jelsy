// Benchmark: 1M property reads on frozen object vs Proxy baseline
// Target: < 2ms
import { Bench } from "tinybench"

const bench = new Bench({ time: 1000 })

// TODO: implement benchmark

bench.run().then(() => {
  console.table(bench.table())
})
