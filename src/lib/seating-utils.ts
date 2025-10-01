import { Table, Seat, SeatAssignment } from './stores/use-seating-store';

export interface GuestWithHousehold {
  id: string;
  householdId?: string;
  isVip: boolean;
  fullName: string;
}

export function autoAllocateByHousehold(
  guests: GuestWithHousehold[],
  tables: Table[],
  currentAssignments: SeatAssignment[]
): SeatAssignment[] {
  const newAssignments: SeatAssignment[] = [...currentAssignments];
  const assignedGuestIds = new Set(newAssignments.map((a) => a.guestId));

  // Group guests by household
  const households = new Map<string, GuestWithHousehold[]>();
  guests.forEach((guest) => {
    if (guest.householdId && !assignedGuestIds.has(guest.id)) {
      const group = households.get(guest.householdId) || [];
      group.push(guest);
      households.set(guest.householdId, group);
    }
  });

  // Get available seats
  const availableSeats = getAllAvailableSeats(tables, newAssignments);

  // Allocate households to tables
  households.forEach((household) => {
    const tableWithSpace = findTableWithSpace(
      tables,
      household.length,
      availableSeats,
      newAssignments
    );

    if (tableWithSpace) {
      const tableSeats = availableSeats.filter(
        (s) => s.tableId === tableWithSpace.id
      );

      household.forEach((guest, index) => {
        if (index < tableSeats.length) {
          newAssignments.push({
            id: `${guest.id}-${tableSeats[index].id}`,
            guestId: guest.id,
            seatId: tableSeats[index].id,
            locked: false,
          });
          availableSeats.splice(
            availableSeats.findIndex((s) => s.id === tableSeats[index].id),
            1
          );
        }
      });
    }
  });

  return newAssignments;
}

export function autoAllocateVIPs(
  vipGuests: GuestWithHousehold[],
  tables: Table[],
  currentAssignments: SeatAssignment[]
): SeatAssignment[] {
  const newAssignments: SeatAssignment[] = [...currentAssignments];
  const assignedGuestIds = new Set(newAssignments.map((a) => a.guestId));

  // Find main table (usually table 1 or labeled "Principal")
  const mainTable = tables.find(
    (t) => t.label.toLowerCase().includes('principal') || t.label === 'Mesa 1'
  ) || tables[0];

  if (!mainTable) return newAssignments;

  const mainTableSeats = getAllAvailableSeats([mainTable], newAssignments);

  vipGuests.forEach((guest) => {
    if (!assignedGuestIds.has(guest.id) && mainTableSeats.length > 0) {
      const seat = mainTableSeats.shift()!;
      newAssignments.push({
        id: `${guest.id}-${seat.id}`,
        guestId: guest.id,
        seatId: seat.id,
        locked: true, // Lock VIP assignments
      });
      assignedGuestIds.add(guest.id);
    }
  });

  return newAssignments;
}

function getAllAvailableSeats(
  tables: Table[],
  assignments: SeatAssignment[]
): Seat[] {
  const assignedSeatIds = new Set(assignments.map((a) => a.seatId));
  const allSeats: Seat[] = [];

  tables.forEach((table) => {
    table.seats.forEach((seat) => {
      if (!assignedSeatIds.has(seat.id)) {
        allSeats.push(seat);
      }
    });
  });

  return allSeats;
}

function findTableWithSpace(
  tables: Table[],
  requiredSeats: number,
  availableSeats: Seat[],
  assignments: SeatAssignment[]
): Table | null {
  for (const table of tables) {
    const tableAvailableSeats = availableSeats.filter(
      (s) => s.tableId === table.id
    );
    if (tableAvailableSeats.length >= requiredSeats) {
      return table;
    }
  }
  return null;
}

export function getTableOccupancy(
  table: Table,
  assignments: SeatAssignment[]
): number {
  const occupiedSeats = assignments.filter((a) =>
    table.seats.some((s) => s.id === a.seatId)
  ).length;
  return (occupiedSeats / table.capacity) * 100;
}
