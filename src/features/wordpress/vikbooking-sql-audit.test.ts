import { describe, expect, it } from "vitest";
import { auditVikBookingSql } from "./vikbooking-sql-audit";

describe("VikBooking SQL audit", () => {
  it("aggregates booking metadata without returning customer fields", () => {
    const sql = [
      "INSERT INTO `wp_vikbooking_orders` (`id`,`status`,`checkin`,`checkout`,`custmail`) VALUES (1,'confirmed',1800000000,1800086400,'private@example.com');",
      "INSERT INTO `wp_vikbooking_busy` (`id`,`idroom`,`checkin`,`checkout`) VALUES (4,1,1800000000,1800086400);",
      "INSERT INTO `wp_vikbooking_ordersbusy` (`id`,`idorder`,`idbusy`) VALUES (8,1,4);",
      "INSERT INTO `wp_vikbooking_ordersrooms` (`id`,`idorder`,`idroom`) VALUES (9,1,1);",
    ].join("\n");
    const result = auditVikBookingSql(sql, 1_700_000_000);
    expect(result.orders).toMatchObject({ total: 1, statuses: { confirmed: 1 }, futureOrCurrentAtAudit: 1 });
    expect(result.linkage).toEqual({ orphanOrderBusyLinks: 0, orphanOrderRoomLinks: 0 });
    expect(JSON.stringify(result)).not.toContain("private@example.com");
  });
});
