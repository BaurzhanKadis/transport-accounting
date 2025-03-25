"use client";
import React, { use, useState } from "react";
// import { useParams } from "next/navigation";
import { Api } from "@/services/api-client";
import {
  Transport,
  MaintenanceRecord,
  Category,
  MaintenanceType,
} from "@prisma/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoaderCircle } from "lucide-react";
import { useDebounce } from "react-use";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MaintenanceDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [transport, setTransport] = useState<Transport | null>(null);
  //   const [transport, setTransport] = useState<Transport[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [category, setCategory] = React.useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "TO1" as MaintenanceType,
    mileage: "",
    description: "",
    cost: "",
  });

  //   useDebounce(
  //     async () => {
  //       try {
  //         const transportData = await Api.transports.getTransport(parseInt(id));
  //         setTransport(transportData);
  //         console.log(transport);

  //         const categories = await Api.categoryes.categoryes();
  //         const transportCategory = categories.find(
  //           (c) => c.id === transportData.categoryId
  //         );
  //         setCategory(transportCategory || null);

  //         const records = await Api.maintenanceRecords.getByTransportId(
  //           Number(id)
  //         );
  //         // Сортируем записи по дате, новые сверху
  //         // const sortedRecords = Array.from(records).sort(
  //         //   (a: MaintenanceRecord, b: MaintenanceRecord) =>
  //         //     new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  //         // );
  //         // setMaintenanceRecords(sortedRecords);
  //         setMaintenanceRecords(records);
  //       } catch (error) {
  //         console.error("Ошибка при загрузке данных:", error);
  //       }
  //     },
  //     250,
  //     []
  //   );

  useDebounce(
    async () => {
      try {
        const transportData = await Api.transports.getTransport(parseInt(id));

        if (!transportData) {
          console.error("Транспорт не найден");
          return;
        }

        setTransport(transportData);

        const categories = await Api.categoryes.categoryes();
        const transportCategory = categories.find(
          (c) => c.id === transportData.categoryId
        );
        setCategory(transportCategory || null);

        const records = await Api.maintenanceRecords.getByTransportId(
          Number(id)
        );
        if (Array.isArray(records)) {
          setMaintenanceRecords(records);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    },
    250,
    [id]
  );

  // Сбрасываем форму при закрытии диалога
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open && transport) {
      // При открытии формы устанавливаем текущий пробег
      setFormData((prev) => ({
        ...prev,
        mileage: String(transport.generalKM),
      }));
    } else {
      // При закрытии очищаем форму
      setFormData({
        type: "TO1" as MaintenanceType,
        mileage: "",
        description: "",
        cost: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем, что введенный пробег не меньше текущего
    if (
      transport &&
      transport.generalKM !== null &&
      Number(formData.mileage) < transport.generalKM
    ) {
      alert("Пробег не может быть меньше текущего");
      return;
    }

    try {
      const record = await Api.maintenanceRecords.createMaintenanceRecord({
        transportId: Number(id),
        type: formData.type,
        mileage: Number(formData.mileage),
        description: formData.description || undefined,
        cost: formData.cost ? Number(formData.cost) : undefined,
      });

      // Обновляем пробег транспорта
      if (transport) {
        await Api.transports.updateTransport(Number(id), {
          name: transport.name || "",
          gosNumber: transport.gosNumber,
          categoryId: transport.categoryId,
          statusId: transport.statusId,
          generalKM: Number(formData.mileage),
        });
        setTransport({
          ...transport,
          generalKM: Number(formData.mileage),
        });

        // Обновляем состояние ТО
        if (formData.type === "TO1") {
          await Api.transports.updateTO1(Number(id), {
            nextTO1: Number(formData.mileage),
            isTO1Started: true,
          });
          setTransport((prev) => ({
            ...prev!,
            nextTO1: Number(formData.mileage),
            isTO1Started: true,
          }));
        } else if (formData.type === "TO2") {
          await Api.transports.updateTO2(Number(id), {
            nextTO2: Number(formData.mileage),
            isTO2Started: true,
          });
          // При выполнении ТО-2 сбрасываем флаг ТО-1
          await Api.transports.updateTO1(Number(id), {
            nextTO1: Number(formData.mileage),
            isTO1Started: false,
          });
          setTransport((prev) => ({
            ...prev!,
            nextTO2: Number(formData.mileage),
            isTO2Started: true,
            isTO1Started: false,
          }));
        }
      }

      setMaintenanceRecords((prev) => [record, ...prev]);
      setIsDialogOpen(false);
      setFormData({
        type: "TO1" as MaintenanceType,
        mileage: "",
        description: "",
        cost: "",
      });
    } catch (error) {
      console.error("Ошибка при создании записи ТО:", error);
    }
  };

  // Функция для получения последней записи определенного типа ТО
  const getLastMaintenanceOfType = (type: MaintenanceType) => {
    return maintenanceRecords
      .filter((record) => record.type === type)
      .sort((a, b) => b.mileage - a.mileage)[0];
  };

  // Функция для расчета следующего ТО определенного типа
  const calculateNextMaintenance = (type: MaintenanceType): number | null => {
    if (!transport || !category) return null;
    if (transport.generalKM === null) return null;

    const interval =
      type === "TO1" ? category.distanceTO1 : category.distanceTO2;
    if (!interval) return null;

    if (type === "TO1") {
      // Если ТО-1 уже начато и ТО-2 еще не выполнено, не показываем следующее ТО-1
      if (transport.isTO1Started && !transport.isTO2Started) {
        return null;
      }

      const lastTO2 = getLastMaintenanceOfType("TO2");

      // Если есть ТО-2, считаем следующее ТО-1 от него
      if (lastTO2) {
        // Если isTO1Started false, возвращаем отрицательное значение для показа просрочки
        if (!transport.isTO1Started) {
          return lastTO2.mileage - transport.generalKM;
        }
        return lastTO2.mileage + interval;
      }

      // Если нет ни одного ТО, возвращаем null
      return null;
    } else {
      // Для ТО-2 берем последнюю запись о ТО-2 из истории обслуживания
      const lastTO2 = getLastMaintenanceOfType("TO2");
      if (!lastTO2) {
        return null; // Если нет записей, возвращаем null
      }
      return lastTO2.mileage + interval;
    }
  };

  // Функция для определения остатка до следующего ТО
  const getRemainingDistance = (type: MaintenanceType): number | null => {
    if (!transport || transport.generalKM === null) return null;

    const nextMaintenance = calculateNextMaintenance(type);
    if (nextMaintenance === null) return null;

    // Для ТО-1, если isTO1Started false, возвращаем значение как есть (оно уже отрицательное)
    if (type === "TO1" && !transport.isTO1Started) {
      return nextMaintenance;
    }

    return nextMaintenance - transport.generalKM;
  };

  if (!transport) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="w-10 h-10 animate-spin" />
        <p className="ml-2">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          История технического обслуживания: {transport?.name}
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>Добавить ТО</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Добавить запись о техническом обслуживании
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Тип ТО</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: MaintenanceType) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TO1">ТО-1</SelectItem>
                    <SelectItem value="TO2">ТО-2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Пробег (км)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  min={transport?.generalKM || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, mileage: e.target.value })
                  }
                  required
                />
                {transport?.generalKM && (
                  <p className="text-sm text-gray-500">
                    Текущий пробег: {transport.generalKM.toLocaleString()} км
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание работ</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Стоимость (₽)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Сохранить
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Информация о транспорте</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-600">Гос. номер:</p>
            <p className="font-medium">{transport.gosNumber}</p>
          </div>
          <div>
            <p className="text-gray-600">Общий пробег:</p>
            <p className="font-medium">
              {transport.generalKM?.toLocaleString()} км
            </p>
          </div>
          <div>
            <p className="text-gray-600">Категория:</p>
            <p className="font-medium">{category?.name || "Не указана"}</p>
          </div>
          <div>
            <p className="text-gray-600">Интервалы ТО:</p>
            <p className="font-medium">
              ТО-1: {category?.distanceTO1?.toLocaleString() || "-"} км
              <br />
              ТО-2: {category?.distanceTO2?.toLocaleString() || "-"} км
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">До следующего ТО-1:</p>
            <p className="font-medium">
              {(() => {
                const lastTO2 = getLastMaintenanceOfType("TO2");
                if (!lastTO2) {
                  return "ТО1 не пройдено";
                }
                const remaining = getRemainingDistance("TO1");
                if (remaining === null) return "-";
                return remaining <= 0
                  ? `Просрочено на ${Math.abs(remaining).toLocaleString()} км`
                  : `${remaining.toLocaleString()} км`;
              })()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">До следующего ТО-2:</p>
            <p className="font-medium">
              {(() => {
                const lastTO2 = getLastMaintenanceOfType("TO2");
                if (!lastTO2) {
                  return "ТО2 не пройдено";
                }
                const remaining = getRemainingDistance("TO2");
                if (remaining === null) return "-";
                return remaining <= 0
                  ? `Просрочено на ${Math.abs(remaining).toLocaleString()} км`
                  : `${remaining.toLocaleString()} км`;
              })()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableCaption>
            {maintenanceRecords.length === 0
              ? "История технического обслуживания пуста"
              : "История технического обслуживания"}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Тип ТО</TableHead>
              <TableHead>Пробег</TableHead>
              <TableHead>Описание работ</TableHead>
              <TableHead className="text-right">Стоимость</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenanceRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {new Date(record.createdAt).toLocaleDateString("ru-RU")}
                </TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.mileage?.toLocaleString()} км</TableCell>
                <TableCell>{record.description}</TableCell>
                <TableCell className="text-right">
                  {record.cost?.toLocaleString()} ₽
                </TableCell>
              </TableRow>
            ))}
            {maintenanceRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  Записей о техническом обслуживании пока нет
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
