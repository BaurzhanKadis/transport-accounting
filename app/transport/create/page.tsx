"use client";
import { FormContainer } from "@/components/shared/form-container";
import { Api } from "@/services/api-client";
import { Category, Status } from "@prisma/client";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useDebounce } from "react-use";
import { useRouter } from "next/navigation";
// import useAuthStore from "@/store/authUser";
// import { supabase } from "@/lib/supabase/config";
// import { createClient } from "@/lib/supabase/client";

export default function CreateNewTransport() {
  const router = useRouter();
  // const { user } = useAuthStore();

  const [name, setName] = React.useState("");
  const [userId, setUserId] = React.useState("");
  const [gosNumber, setGosnumber] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<number>(0);
  const [statusId, setStatusId] = React.useState<number>(0);
  const [allStatus, setAllStatus] = React.useState<Status[]>([]);
  const [allCategories, setAllCategories] = React.useState<Category[]>([]);
  const [generalKM, setGeneralKM] = React.useState<number>(0);

  // const supabase = await createClient();
  // const { data, error } = await supabase.auth.getUser();
  // if (error || !data?.user) {
  //   console.log(data);
  // }

  useDebounce(
    async () => {
      try {
        const [categories, statuses] = await Promise.all([
          Api.categoryes.categoryes(),
          Api.status.allStatus(),
        ]);
        setAllCategories(categories);
        setAllStatus(statuses);
        // const response = await fetch("/api/user/me");
        // if (!response.ok) {
        //   throw new Error("Failed to fetch user data");
        // }
        // const data = await response.json();
        // setUserId(data.id);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Ошибка загрузки данных");
      }
    },
    250,
    [allStatus, allCategories]
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/me");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUserId(data.id);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, [userId]);

  console.log(userId, "userId");

  // useEffect(() => {
  //   const { data: authListener } = supabase.auth.onAuthStateChange(
  //     (event, session) => {
  //       if (session) {
  //         useAuthStore.setState({
  //           user: {
  //             id: session.user.id,
  //             fullName: session.user.user_metadata?.full_name || "",
  //             email: session.user.email || "",
  //             password: "",
  //             role: session.user.user_metadata?.role || "USER",
  //             createdAt: new Date(session.user.created_at),
  //             updateAt: new Date(),
  //           },
  //         });
  //       } else {
  //         useAuthStore.setState({ user: null });
  //       }
  //     }
  //   );

  //   return () => {
  //     authListener.subscription.unsubscribe();
  //   };
  // }, []);

  // console.log(user);

  const createT = async () => {
    if (!name || !gosNumber || !categoryId || !statusId || !generalKM) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const data = {
      name,
      gosNumber,
      categoryId,
      statusId,
      generalKM,
      userId: userId || "",
    };
    try {
      console.log("Sending transport data:", data);
      const response = await Api.transports.newTransport(data);
      console.log("Transport created successfully:", response);
      toast.success("ТС Добавлено успешно");
      router.push("/transport");
    } catch (error: unknown) {
      console.error("Error creating transport:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка добавления ТС";
      toast.error(errorMessage);
    }
  };

  return (
    <FormContainer
      title="Создать"
      name={name}
      gosnumber={gosNumber}
      categoryId={categoryId}
      statusId={statusId}
      setName={setName}
      setGosnumber={setGosnumber}
      setCategoryId={setCategoryId}
      setStatusId={setStatusId}
      allStatus={allStatus}
      allCategories={allCategories}
      createOrUpdateTransport={createT}
      generalKM={generalKM}
      setGeneralKM={setGeneralKM}
    />
  );
}
