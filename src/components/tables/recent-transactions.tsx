import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  qty: number;
  date: string;
  product?: { name: string; sku: string } | null;
}

interface RecentTransactionsProps {
  title: string;
  type: "in" | "out";
  data: Transaction[];
}

export function RecentTransactions({ title, type, data }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data</p>
        ) : (
          <div className="space-y-3">
            {data.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">
                    {item.product?.name || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.product?.sku}
                  </p>
                </div>
                <Badge variant={type === "in" ? "default" : "destructive"}>
                  {type === "in" ? "+" : "-"}
                  {item.qty}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
