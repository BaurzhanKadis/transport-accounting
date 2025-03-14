"use client";
import { Container } from "@/components/shared";
import { Api } from "@/services/api-client";
import { Transport, Status } from "@prisma/client";
import React from "react";
import { useDebounce } from "react-use";

export default function StatusPage() {
  const [allTransports, setAllTransports] = React.useState<Transport[]>([]);
  const [allStatus, setAllStatus] = React.useState<Status[]>([]);
  // const [value, setValue] = React.useState("");
  //   const [transportId, setTransportId] = React.useState("");
  //   const nameField = React.useRef("");

  useDebounce(
    async () => {
      try {
        const response = await Api.transports.allTransport();
        const d = await Api.status.allStatus();
        setAllStatus(d);
        setAllTransports(response);
      } catch (error) {
        console.log(error);
      }
    },
    150,
    []
  );

  useDebounce(
    async () => {
      // const rrr = a
      // setTransportId()

      try {
        // const id = 13;
        // const dataUpdate = { statusId: 2 };
        console.log("777");
        // const re = await Api.transports.updateStatusTransport(id, dataUpdate);
        // return re;
      } catch (error) {
        console.log(error);
      }
    },
    100,
    []
  );

  return (
    <div className="p-3">
      <h1>Статус ТС</h1>
      <Container className=" flex flex-col gap-1">
        {allTransports.map((item) => (
          <div
            key={item.id}
            id={String(item.id)}
            className=" flex items-center justify-between bg-[#E6F1FD] p-3 z-0"
          >
            {item.gosNumber}
            <div>{allStatus.find((e) => e.id === item.statusId)?.name}</div>
            <div className="flex items-center"></div>
          </div>
        ))}
      </Container>
    </div>
  );
}
