import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useErrorTest } from '@/hooks/use-error-test';

export default function ErrorTest() {
  const { throwError } = useErrorTest();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Error Boundary Test</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Click the button below to simulate an error that will be caught by the ErrorBoundary component.
          After the error is thrown, you'll see the error UI with a "Try Again" button.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={throwError} variant="destructive">
          Trigger Error
        </Button>
      </CardFooter>
    </Card>
  );
}