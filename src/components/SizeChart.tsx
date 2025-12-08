import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ruler } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const SizeChart = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Ruler className="h-4 w-4" />
          Таблица размеров
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Таблица размеров</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="bra" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bra">Бюстгальтеры</TabsTrigger>
            <TabsTrigger value="panties">Трусы</TabsTrigger>
            <TabsTrigger value="sleepwear">Сорочки</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bra" className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="p-3 text-left font-semibold">Размер</th>
                    <th className="p-3 text-left font-semibold">Обхват под грудью (см)</th>
                    <th className="p-3 text-left font-semibold">Обхват груди (см)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: "70A", under: "68-72", bust: "82-84" },
                    { size: "70B", under: "68-72", bust: "84-86" },
                    { size: "75A", under: "73-77", bust: "87-89" },
                    { size: "75B", under: "73-77", bust: "89-91" },
                    { size: "75C", under: "73-77", bust: "91-93" },
                    { size: "80A", under: "78-82", bust: "92-94" },
                    { size: "80B", under: "78-82", bust: "94-96" },
                    { size: "80C", under: "78-82", bust: "96-98" },
                    { size: "85B", under: "83-87", bust: "99-101" },
                    { size: "85C", under: "83-87", bust: "101-103" },
                  ].map((row, i) => (
                    <tr key={row.size} className={i % 2 === 0 ? "bg-secondary/20" : ""}>
                      <td className="p-3 font-medium">{row.size}</td>
                      <td className="p-3 text-muted-foreground">{row.under}</td>
                      <td className="p-3 text-muted-foreground">{row.bust}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="panties" className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="p-3 text-left font-semibold">Размер</th>
                    <th className="p-3 text-left font-semibold">Обхват бёдер (см)</th>
                    <th className="p-3 text-left font-semibold">Обхват талии (см)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: "XS", hips: "86-90", waist: "60-64" },
                    { size: "S", hips: "90-94", waist: "64-68" },
                    { size: "M", hips: "94-98", waist: "68-72" },
                    { size: "L", hips: "98-102", waist: "72-76" },
                    { size: "XL", hips: "102-106", waist: "76-80" },
                    { size: "XXL", hips: "106-110", waist: "80-84" },
                  ].map((row, i) => (
                    <tr key={row.size} className={i % 2 === 0 ? "bg-secondary/20" : ""}>
                      <td className="p-3 font-medium">{row.size}</td>
                      <td className="p-3 text-muted-foreground">{row.hips}</td>
                      <td className="p-3 text-muted-foreground">{row.waist}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="sleepwear" className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="p-3 text-left font-semibold">Размер</th>
                    <th className="p-3 text-left font-semibold">Обхват груди (см)</th>
                    <th className="p-3 text-left font-semibold">Обхват бёдер (см)</th>
                    <th className="p-3 text-left font-semibold">Длина (см)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: "XS", bust: "80-84", hips: "86-90", length: "80" },
                    { size: "S", bust: "84-88", hips: "90-94", length: "82" },
                    { size: "M", bust: "88-92", hips: "94-98", length: "84" },
                    { size: "L", bust: "92-96", hips: "98-102", length: "86" },
                    { size: "XL", bust: "96-100", hips: "102-106", length: "88" },
                    { size: "XXL", bust: "100-104", hips: "106-110", length: "90" },
                  ].map((row, i) => (
                    <tr key={row.size} className={i % 2 === 0 ? "bg-secondary/20" : ""}>
                      <td className="p-3 font-medium">{row.size}</td>
                      <td className="p-3 text-muted-foreground">{row.bust}</td>
                      <td className="p-3 text-muted-foreground">{row.hips}</td>
                      <td className="p-3 text-muted-foreground">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
          <h4 className="font-semibold mb-2">💡 Как измерить себя?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Обхват груди</strong> — измеряйте по самой выступающей точке груди</li>
            <li>• <strong>Обхват под грудью</strong> — измеряйте непосредственно под грудью</li>
            <li>• <strong>Обхват бёдер</strong> — измеряйте по самой широкой части бёдер</li>
            <li>• <strong>Обхват талии</strong> — измеряйте по самой узкой части талии</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
