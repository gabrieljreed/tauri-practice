import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCounterStore } from "@/stores/counterStore";

export function CardDemoBasic() {
  const { count, increment } = useCounterStore();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Counter</CardTitle>
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
      </CardFooter>
    </Card>
  );
}
