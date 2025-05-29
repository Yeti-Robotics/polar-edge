import * as dal from "../dal";
import { getUserAttendance, UserAttendance } from "../dto";
import { AttendanceRecord } from "../model";

jest.mock("../dal", () => ({
	getUserAttendanceData: jest.fn(),
}));

const mockedDal = dal as jest.Mocked<typeof dal>;

describe("getUserAttendance function", () => {
	it("handles error where user is not authenticated", async () => {
		mockedDal.getUserAttendanceData.mockRejectedValue(
			new Error("Unauthorized")
		);
		const attendance = await getUserAttendance();
		expect(attendance).toBeNull();
	});

	it("returns a UserAttendance object", async () => {
		const mockAttendanceData: AttendanceRecord[] = [
			{
				timestamp: "2021-01-01T00:00:00Z",
				isCheckingIn: true,
				discordId: "123",
				name: "Test User",
			},
		];

		mockedDal.getUserAttendanceData.mockResolvedValue(mockAttendanceData);
		const attendance = await getUserAttendance();
		expect(attendance).toBeDefined();
		expect(attendance).toBeInstanceOf(UserAttendance);
	});
});

describe("UserAttendance object", () => {
	it("returns 0 hours when user has no attendance records", () => {
		const attendance = new UserAttendance([]);
		expect(attendance.hours).toBe(0);
	});

	it("returns correct hours with valid attendance data", () => {
		const mockAttendanceData: AttendanceRecord[] = [
			{
				timestamp: "2021-01-01T00:00:00Z",
				isCheckingIn: true,
				discordId: "123",
				name: "Test User",
			},
			{
				timestamp: "2021-01-01T01:00:00Z",
				isCheckingIn: false,
				discordId: "123",
				name: "Test User",
			},
			{
				timestamp: "2021-01-01T02:15:00Z",
				isCheckingIn: true,
				discordId: "123",
				name: "Test User",
			},
			{
				timestamp: "2021-01-01T03:00:00Z",
				isCheckingIn: false,
				discordId: "123",
				name: "Test User",
			},
			{
				timestamp: "2021-01-02T03:15:00Z",
				isCheckingIn: true,
				discordId: "123",
				name: "Test User",
			},
			{
				timestamp: "2021-01-02T04:00:00Z",
				isCheckingIn: false,
				discordId: "123",
				name: "Test User",
			},
		];
		const attendance = new UserAttendance(mockAttendanceData);
		expect(attendance.hours).toBe(2.5);
	});

	it("throws an error when user has duplicate check in", () => {
		const mockAttendanceData: AttendanceRecord[] = [
			{
				timestamp: "2021-01-01T00:00:00Z",
				isCheckingIn: true,
				discordId: "123",
				name: "Test User",
			},
			{
				timestamp: "2021-01-01T02:00:00Z",
				isCheckingIn: true,
				discordId: "123",
				name: "Test User",
			},
		];
		const attendance = new UserAttendance(mockAttendanceData);
		expect(() => attendance.hours).toThrow("User is already checked in");
	});

	it("throws an error when user is not checked in and trying to check out", () => {
		const mockAttendanceData: AttendanceRecord[] = [
			{
				timestamp: "2021-01-01T00:00:00Z",
				isCheckingIn: true,
				discordId: "123",
				name: "Test User",
			},
			{
				timestamp: "2021-01-01T01:00:00Z",
				isCheckingIn: false,
				discordId: "123",
				name: "Test User",
			},
			{
				timestamp: "2021-01-01T02:00:00Z",
				isCheckingIn: false,
				discordId: "123",
				name: "Test User",
			},
		];
		const attendance = new UserAttendance(mockAttendanceData);
		expect(() => {
			console.log(attendance.hours);
		}).toThrow("User is not checked in and trying to check out");
	});
});
