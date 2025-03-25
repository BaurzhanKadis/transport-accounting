"use client";
import { FormContainer } from "@/components/shared/form-container";
import { Api } from "@/services/api-client";
import { Category, Status } from "@prisma/client";
import React from "react";
import toast from "react-hot-toast";
import { useDebounce } from "react-use";
import { useRouter } from "next/navigation";

export default function CreateNewTransport() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [gosNumber, setGosnumber] = React.useState("");
  const [categoryId, setCategoryId] = React.useState(Number());
  const [statusId, setStatusId] = React.useState(Number());
  const [allStatus, setAllStatus] = React.useState<Status[]>([]);
  const [allCategories, setAllCategories] = React.useState<Category[]>([]);
  const [generalKM, setGeneralKM] = React.useState(Number());

  const createT = async () => {
    if (!name || !gosNumber || !categoryId || !statusId || !generalKM) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const data = { name, gosNumber, categoryId, statusId, generalKM };
    try {
      await Api.transports.newTransport(data);
      toast.success("ТС Добавлено успешно");
      router.push("/transport");
    } catch (error) {
      console.error("Error creating transport:", error);
      toast.error("Ошибка добавления ТС");
    }
  };

  useDebounce(
    async () => {
      try {
        setAllStatus(await Api.status.allStatus());
        setAllCategories(await Api.categoryes.categoryes());
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Ошибка загрузки данных");
      }
    },
    150,
    []
  );

  // console.log(generalKM, "generalKM")

  return (
    <div className="">
      <FormContainer
        title="Создать"
        setName={setName}
        setGosnumber={setGosnumber}
        setCategoryId={setCategoryId}
        createOrUpdateTransport={createT}
        name={name}
        gosnumber={gosNumber}
        categoryId={categoryId}
        statusId={statusId}
        setStatusId={setStatusId}
        allStatus={allStatus}
        allCategories={allCategories}
        generalKM={generalKM}
        setGeneralKM={setGeneralKM}
      />
    </div>
  );
}
