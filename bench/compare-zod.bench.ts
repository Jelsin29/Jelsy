// Benchmark: Jelsy vs Zod for env-shaped flat record validation
import { Bench } from "tinybench"

const bench = new Bench({ time: 1000 })

// TODO: implement benchmark (requires zod as devDep)

bench.run().then(() => {
  console.table(bench.table())
})
