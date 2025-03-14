"use client";
import { FormContainer } from "@/components/shared/form-container";
import { Api } from "@/services/api-client";
import { Category, Status } from "@prisma/client";
import React from "react";
import toast from "react-hot-toast";
import { useDebounce } from "react-use";

export default function CreateNewTransport() {
  const [name, setName] = React.useState("");
  const [gosNumber, setGosnumber] = React.useState("");
  const [categoryId, setCategoryId] = React.useState(Number());
  const [statusId, setStatusId] = React.useState(Number());
  const [allStatus, setAllStatus] = React.useState<Status[]>([]);
  const [allCategories, setAllCategories] = React.useState<Category[]>([]);
  const [generalKM, setGeneralKM] = React.useState(Number());
  const createT = async () => {
    const data = { name, gosNumber, categoryId, statusId, generalKM };
    try {
      const re = await Api.transports.newTransport(data);
      toast.success("ТС Добавлено успешно");
      return re;
    } catch (error) {
      toast.error("Ошибка добавления ТС");
      console.log(error);
    }
  };

  useDebounce(
    async () => {
      try {
        setAllStatus(await Api.status.allStatus());
        setAllCategories(await Api.categoryes.categoryes());
      } catch (error) {
        console.log(error);
      }
    },
    150,
    []
  );

  // console.log(generalKM, "generalKM");

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
