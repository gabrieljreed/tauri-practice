import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRustCounterStore } from "@/stores/counterStore"

export function CardDemoRust() {
  const { count, isCalculating, doHardCalculation } = useRustCounterStore();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Counter (Rust)</CardTitle>
        <CardDescription>
          Click the button below to increment the counter
        </CardDescription>
      </CardHeader>
      <CardContent>
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
