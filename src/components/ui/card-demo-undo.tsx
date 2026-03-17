import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useStoreWithUndo } from "@/store/counterStore"

export function CardDemoUndo() {
  const { count, increment, reset, updateCount } = useStoreWithUndo();
  const { undo, redo, clear } = useStoreWithUndo.temporal.getState();


  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Counter (with undo)</CardTitle>
        <CardDescription>
          Click the button below to increment the counter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">Count: {count}</p>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full" onClick={increment}>
          Increment
        </Button>
        <Button className="w-full" variant="outline" onClick={() => undo()}>
          Undo
        </Button>
      </CardFooter>
    </Card>
  )
}
