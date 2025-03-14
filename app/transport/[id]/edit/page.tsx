"use client";
import { FormContainer } from "@/components/shared/form-container";
import { Api } from "@/services/api-client";
import { Status, Category } from "@prisma/client";
import React, { use } from "react";
import { toast } from "react-hot-toast";
import { useDebounce } from "react-use";

export default function Edit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [name, setName] = React.useState("");
  const [gosNumber, setGosnumber] = React.useState("");
  const [categoryId, setCategoryId] = React.useState(Number());
  const [statusId, setStatusId] = React.useState(Number());
  const [allStatus, setAllStatus] = React.useState<Status[]>([]);
  const [allCategories, setAllCategories] = React.useState<Category[]>([]);
  const [generalKM, setGeneralKM] = React.useState(Number());
  const updateTransport = async () => {
    const data = { name, gosNumber, categoryId, statusId, generalKM };
    try {
      const response = await Api.transports.updateTransport(Number(id), data);
      if (response) {
        toast.success("Транспорт успешно обновлен");
        setName(response.name);
        setGosnumber(response.gosNumber);
        setCategoryId(response.categoryId);
        setStatusId(response.statusId);
        setGeneralKM(response.generalKM);
        console.log(response, "response");
      }
    } catch (error) {
      console.error("Error updating transport:", error);
      toast.error("Ошибка при обновлении транспорта");
    }
  };

  // console.log(statusId, name, gosNumber, categoryId, id);

  useDebounce(
    async () => {
      try {
        const response = await Api.transports.getTransport(Number(id));
        const statusData = await Api.status.allStatus();
        const categoriesData = await Api.categoryes.categoryes();
        setAllStatus(statusData);
        setAllCategories(categoriesData);
        if (response) {
          setName(response.name || "");
          setGosnumber(response.gosNumber || "");
          setCategoryId(response.categoryId);
          setStatusId(response.statusId || 0);
          setGeneralKM(response.generalKM || 0);
        }
      } catch (error) {
        console.log(error);
      }
    },
    100,
    []
  );
  return (
    <div className="p-3 min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <FormContainer
        className="bg-white rounded-lg shadow-lg border border-slate-200"
        title="Редактировать"
        setName={setName}
        name={name}
        setGosnumber={setGosnumber}
        gosnumber={gosNumber}
        setCategoryId={setCategoryId}
        categoryId={categoryId}
        setStatusId={setStatusId}
        statusId={statusId}
        createOrUpdateTransport={updateTransport}
        allStatus={allStatus}
        allCategories={allCategories}
        generalKM={generalKM}
        setGeneralKM={setGeneralKM}
      />
    </div>
  );
}
