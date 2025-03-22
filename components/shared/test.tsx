// // model Vehicle {
// //   id             String   @id @default(uuid())
// //   registrationNo String   @unique // Госномер ТС
// //   model          String
// //   year           Int
// //   maintenanceRecords MaintenanceRecord[]
// //   auditLogs      AuditLog[]
// //   notifications  Notification[]
// // }

// // model MaintenanceRecord {
// //   id          String   @id @default(uuid())
// //   vehicleId   String
// //   date        DateTime
// //   description String
// //   cost        Float
// //   vehicle     Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
// //   auditLogs   AuditLog[]
// // }

// // model AuditLog {
// //   id              String   @id @default(uuid())
// //   entityType      String   // Vehicle или MaintenanceRecord
// //   entityId        String   // ID измененной сущности
// //   action          String   // CREATE, UPDATE, DELETE
// //   timestamp       DateTime @default(now())
// //   performedBy     String   // ID пользователя
// //   vehicle         Vehicle? @relation(fields: [entityId], references: [id])
// //   maintenanceRecord MaintenanceRecord? @relation(fields: [entityId], references: [id])
// // }

// // model Statistic {
// //   id              String   @id @default(uuid())
// //   vehicleId       String
// //   totalCost       Float    @default(0.0) // Общая стоимость ТО
// //   lastServiceDate DateTime?
// //   serviceCount    Int      @default(0)
// //   vehicle         Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
// // }

// // model Notification {
// //   id          String   @id @default(uuid())
// //   vehicleId   String
// //   dueDate     DateTime // Дата предстоящего ТО
// //   message     String
// //   isSent      Boolean  @default(false) // Статус отправки
// //   vehicle     Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
// // }
// CREATE OR REPLACE FUNCTION update_to_counter(
//   transport_id INT,
//   mileage INT,
//   type TEXT
// )
// RETURNS TEXT AS $$
// DECLARE
//   current_category RECORD;
//   current_transport RECORD;
//   performed_to TEXT;
//   overdue_km INT;
// BEGIN
//   -- Получаем данные о ТС и категории
//   SELECT * INTO current_transport FROM transport WHERE id = transport_id;
//   IF NOT FOUND THEN
//       RETURN 'Транспорт не найден';
//   END IF;

//   SELECT * INTO current_category FROM category WHERE id = current_transport.categoryId;

//   -- Проверяем просроченный пробег для ТО-1
//   IF current_transport.nextTO1 IS NOT NULL THEN
//       overdue_km := mileage - current_transport.nextTO1;
//   ELSE
//       overdue_km := 0;
//   END IF;

//   -- Если выполняется ТО-1
//   IF type = 'TO1' THEN
//       IF NOT current_transport.isTO1Started THEN
//           RETURN 'ТО-1 уже выполнено, дождитесь ТО-2';
//       END IF;

//       -- Обновляем счетчик ТО-1, учитывая просрочку
//       UPDATE transport
//       SET isTO1Started = FALSE,
//           nextTO1 = mileage + COALESCE(current_category.distanceTO1, 0),
//           overdueTO1 = CASE WHEN overdue_km > 0 THEN -overdue_km ELSE 0 END  -- Если была просрочка, показываем ее в минусе
//       WHERE id = transport_id;

//       performed_to := 'ТО-1';

//   -- Если выполняется ТО-2
//   ELSIF type = 'TO2' THEN
//       IF NOT current_transport.isTO2Started THEN
//           RETURN 'ТО-2 уже выполнено, начался новый цикл';
//       END IF;

//       -- Сбрасываем флаги, обнуляем счетчики
//       UPDATE transport
//       SET isTO1Started = FALSE,
//           isTO2Started = FALSE,
//           nextTO1 = mileage + COALESCE(current_category.distanceTO1, 0),
//           nextTO2 = mileage + COALESCE(current_category.distanceTO2, 0),
//           overdueTO1 = 0  -- Полностью сбрасываем просрочку после ТО-2
//       WHERE id = transport_id;

//       performed_to := 'ТО-2 (новый цикл ТО)';

//   ELSE
//       RETURN 'Неверный тип ТО';
//   END IF;

//   -- Создаем запись в истории ТО
//   INSERT INTO maintenance_record (transportId, mileage, description, cost)
//   VALUES (transport_id, mileage, performed_to, 0);

//   RETURN 'Счетчик обновлен! ' || performed_to;
// END;
// $$ LANGUAGE plpgsql;

{
  /* <LoaderCircle
  className={`w-10 h-10 mr-5 ${
    validForSpin === true ? "block" : "hidden"
  } animate-spin`}
/>; */
}
