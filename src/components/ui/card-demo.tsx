import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCounterStore, useRustCounterStore } from "@/store/counterStore"

export function CardDemo() {
  // const count = useCounterStore((s) => s.count);
  // const increment = useCounterStore((s) => s.increment);
  const { count, isCalculating, doHardCalculation } = useRustCounterStore();

  // const { count, increment } = useCounterStore((s) => ({count: s.count, increment: s.increment}))

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Counter</CardTitle>
        <CardDescription>
          Click the button below to increment the counter
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* If isCalculating is true, show a loading message, otherwise, show the count */}
        <p className="text-2xl font-bold">Count: {count}</p>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full" onClick={doHardCalculation} disabled={isCalculating}>
          {isCalculating ? "Calculating..." : "Increment"}
        </Button>
      </CardFooter>
    </Card>
  )
}
