import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import Settings from "./Settings";
import { AuthContext } from "../context/AuthContext";

// Mock axios
jest.mock("axios");

// Mock the AuthContext
const mockLogin = jest.fn();
const mockLogout = jest.fn();
const mockNavigate = jest.fn();

// Mock useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Settings Component", () => {
  const mockUser = {
    id: 1,
    username: "testuser",
    email: "test@example.com",
    full_name: "Test User",
  };

  const mockUserProfileData = {
    success: true,
    user: {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      full_name: "Test User",
      mobile_no: "01712345678",
      national_id: "1234567890",
      address: "Dhaka-Mirpur",
      created_at: "2023-01-01T00:00:00.000Z",
      last_login: "2023-06-01T00:00:00.000Z",
    },
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    localStorage.clear();

    // Mock localStorage
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("user", JSON.stringify(mockUser));

    // Mock axios responses
    axios.get.mockResolvedValue({ data: mockUserProfileData });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{ user: mockUser, login: mockLogin, logout: mockLogout }}
        >
          <Settings />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  test("loads and displays user profile data", async () => {
    renderComponent();

    // Wait for profile data to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/profile",
        expect.objectContaining({
          headers: {
            Authorization: "Bearer fake-token",
          },
        })
      );
    });

    // Check if profile data is displayed
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("@testuser")).toBeInTheDocument();
  });

  test("edit profile functionality works correctly", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Test User"));

    // Mock update profile response
    axios.put.mockResolvedValue({
      data: {
        success: true,
        user: {
          ...mockUserProfileData.user,
          full_name: "Updated Name",
          email: "updated@example.com",
          mobile_no: "01987654321",
          address: "Chittagong-Halishahar",
        },
      },
    });

    // Click edit profile button
    fireEvent.click(screen.getByText(/Edit Profile/i));

    // Click the edit button in the modal
    const editButtons = screen.getAllByText(/Edit Profile/i);
    fireEvent.click(editButtons[editButtons.length - 1]);

    // Change profile data
    const fullNameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(fullNameInput, { target: { value: "Updated Name" } });

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: "updated@example.com" } });

    const phoneInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneInput, { target: { value: "01987654321" } });

    const addressInput = screen.getByLabelText(/Address/i);
    fireEvent.change(addressInput, {
      target: { value: "Chittagong-Halishahar" },
    });

    // Save changes
    fireEvent.click(screen.getByText(/Save Changes/i));

    // Verify that the API was called with correct data
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/profile",
        {
          full_name: "Updated Name",
          email: "updated@example.com",
          mobile_no: "01987654321",
          address: "Chittagong-Halishahar",
        },
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer fake-token",
          },
        })
      );
    });

    // Verify that login was called to update context
    expect(mockLogin).toHaveBeenCalled();

    // Success message should be shown
    expect(
      screen.getByText(/Profile updated successfully/i)
    ).toBeInTheDocument();
  });

  test("delete account functionality works correctly", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Test User"));

    // Mock delete account response
    axios.delete.mockResolvedValue({
      data: {
        success: true,
        message: "Account deleted successfully",
      },
    });

    // Click delete account button
    fireEvent.click(screen.getByText(/Delete Account/i));

    // Type DELETE in the confirmation input
    const confirmInput = screen.getByLabelText(/To confirm, type/i);
    fireEvent.change(confirmInput, { target: { value: "DELETE" } });

    // Click the delete button in the modal
    fireEvent.click(
      screen.getByText(/Delete Account/i, { selector: "button" })
    );

    // Verify that the API was called
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/account",
        expect.objectContaining({
          headers: {
            Authorization: "Bearer fake-token",
          },
        })
      );
    });

    // Logout should be called
    expect(mockLogout).toHaveBeenCalled();

    // Should redirect to home page
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
