"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormField } from "../ui/form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormMessage,
  FormItem,
  // FormDescription,
  FormControl,
  FormLabel,
} from "../ui/form";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Category, Status } from "@prisma/client";

interface Props {
  className?: string;
  title: string;
  name?: string;
  gosnumber?: string;
  categoryId?: number;
  statusId?: number;
  setName: (value: string) => void;
  setGosnumber: (value: string) => void;
  setCategoryId: (value: number) => void;
  setStatusId: (value: number) => void;
  allStatus: Status[];
  allCategories: Category[];
  createOrUpdateTransport: (id?: number) => void;
  generalKM?: number;
  setGeneralKM: (value: number) => void;
}

// interface FormValues {
//   name: string;
//   gosnumber: string;
//   categoryId: number;
//   statusId: number;
// }

export const FormContainer: React.FC<Props> = ({
  className,
  title,
  name,
  gosnumber,
  categoryId,
  statusId,
  setName,
  setGosnumber,
  setCategoryId,
  setStatusId,
  allStatus,
  allCategories,
  createOrUpdateTransport,
  generalKM,
  setGeneralKM,
}) => {
  const FormSchema = z.object({
    name: z.string().min(2, {
      message: "Название должно содержать минимум 2 символа",
    }),
    gosnumber: z.string().min(2, {
      message: "Гос. номер должен содержать минимум 2 символа",
    }),
    categoryId: z.number().min(1, {
      message: "Категория должна быть выбрана",
    }),
    statusId: z.number().min(1, {
      message: "Статус должен быть выбран",
    }),
    generalKM: z.number(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: name || "",
      gosnumber: gosnumber || "",
      categoryId: categoryId || 0,
      statusId: statusId || 0,
      generalKM: generalKM || 0,
    },
  });

  // Обновляем значение формы при изменении name
  React.useEffect(() => {
    console.log("Effect triggered with:", {
      name,
      gosnumber,
      categoryId,
      statusId,
      allCategories,
      allStatus,
      generalKM,
    });

    if (name) {
      form.setValue("name", name, { shouldValidate: true });
    }
    if (gosnumber) {
      form.setValue("gosnumber", gosnumber, { shouldValidate: true });
    }
    if (categoryId) {
      console.log("Setting categoryId:", categoryId);
      form.setValue("categoryId", categoryId, { shouldValidate: true });
    }
    if (statusId) {
      console.log("Setting statusId:", statusId);
      form.setValue("statusId", statusId, { shouldValidate: true });
    }
    if (generalKM) {
      console.log("Setting generalKM:", generalKM);
      form.setValue("generalKM", generalKM, { shouldValidate: true });
    }
  }, [
    name,
    gosnumber,
    categoryId,
    statusId,
    form,
    allCategories,
    allStatus,
    generalKM,
  ]);

  // Добавляем логирование состояния формы
  React.useEffect(() => {
    console.log("Form state:", {
      values: form.getValues(),
      errors: form.formState.errors,
      isValid: form.formState.isValid,
      isDirty: form.formState.isDirty,
    });
  }, [form, form.formState]);

  function onSubmit() {
    const values = form.getValues();
    console.log("Submitting form with values:", values);
    createOrUpdateTransport();
  }

  console.log(form.formState);

  return (
    <div className={cn(className, "p-6")}>
      <h1 className="text-2xl font-bold mb-6 text-center text-slate-800">
        {title} ТС: <span className="text-blue-600">{gosnumber}</span>
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-slate-50 p-6 rounded-lg space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="mb-4 flex justify-between items-center w-full">
                  <FormLabel className="w-40 text-slate-700">
                    Название
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      className="w-full bg-white border-slate-200 focus:border-blue-300"
                      placeholder="Название"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setName(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gosnumber"
              render={({ field }) => (
                <FormItem className="mb-4 flex justify-between items-center w-full">
                  <FormLabel className="w-40">Гос. номер</FormLabel>
                  <div className="flex flex-col items-center gap-2 w-full relative">
                    <FormControl className="">
                      <Input
                        className="w-full"
                        placeholder="Гос. номер"
                        value={gosnumber}
                        onChange={(e) => {
                          field.onChange(e);
                          setGosnumber(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="absolute bottom-[-20px]" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="mb-4 flex justify-between items-center w-full">
                  <FormLabel className="w-40">Категория</FormLabel>
                  <div className="flex flex-col items-center gap-2 w-full relative">
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          console.log("Category changed to:", value);
                          field.onChange(Number(value));
                          setCategoryId(Number(value));
                        }}
                        value={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue className="text-muted-foreground">
                            {allCategories.find((cat) => cat.id === field.value)
                              ?.name || "Выберите категорию"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {allCategories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="absolute bottom-[-20px]" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="statusId"
              render={({ field }) => (
                <FormItem className="mb-4 flex justify-between items-center w-full">
                  <FormLabel className="w-40">Статус</FormLabel>
                  <div className="flex flex-col items-center gap-2 w-full relative">
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          console.log("Status changed to:", value);
                          field.onChange(Number(value));
                          setStatusId(Number(value));
                        }}
                        value={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue className="text-muted-foreground">
                            {allStatus.find((stat) => stat.id === field.value)
                              ?.name || "Выберите статус"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {allStatus.map((status) => (
                            <SelectItem
                              key={status.id}
                              value={status.id.toString()}
                            >
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="absolute bottom-[-20px]" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="generalKM"
              render={({ field }) => (
                <FormItem className="mb-4 flex justify-between items-center w-full">
                  <FormLabel className="w-40">Пробег</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value || 0}
                      placeholder="Пробег"
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        field.onChange(value);
                        setGeneralKM(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="absolute bottom-[-20px]" />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end">
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6"
              type="submit"
            >
              {title}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
