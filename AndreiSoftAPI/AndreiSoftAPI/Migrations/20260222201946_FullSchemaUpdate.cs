using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AndreiSoftAPI.Migrations
{
    /// <inheritdoc />
    public partial class FullSchemaUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Heads_AspNetUsers_AssignedWorkerId",
                table: "Heads");

            migrationBuilder.RenameColumn(
                name: "HeadDescription",
                table: "Logs",
                newName: "HeadSummary");

            migrationBuilder.RenameColumn(
                name: "AssignedWorkerName",
                table: "Logs",
                newName: "MechanicId");

            migrationBuilder.RenameColumn(
                name: "AssignedWorkerId",
                table: "Logs",
                newName: "MechanicDisplayName");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Heads",
                newName: "ServicePhoneNumber");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Heads",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "AssignedWorkerId",
                table: "Heads",
                newName: "MechanicId");

            migrationBuilder.RenameColumn(
                name: "Actions",
                table: "Heads",
                newName: "ServiceNeeds");

            migrationBuilder.RenameIndex(
                name: "IX_Heads_AssignedWorkerId",
                table: "Heads",
                newName: "IX_Heads_MechanicId");

            migrationBuilder.AddColumn<string>(
                name: "CheckedServiceNeeds",
                table: "Heads",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedDate",
                table: "Heads",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Make",
                table: "Heads",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MechanicDisplayName",
                table: "Heads",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "Heads",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OwnerFirstName",
                table: "Heads",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OwnerLastName",
                table: "Heads",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PartNumber",
                table: "Heads",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ServiceName",
                table: "Heads",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "Heads",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_Heads_AspNetUsers_MechanicId",
                table: "Heads",
                column: "MechanicId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Heads_AspNetUsers_MechanicId",
                table: "Heads");

            migrationBuilder.DropColumn(
                name: "CheckedServiceNeeds",
                table: "Heads");

            migrationBuilder.DropColumn(
                name: "CompletedDate",
                table: "Heads");

            migrationBuilder.DropColumn(
                name: "Make",
                table: "Heads");

            migrationBuilder.DropColumn(
                name: "MechanicDisplayName",
                table: "Heads");

            migrationBuilder.DropColumn(
                name: "Model",
                table: "Heads");

            migrationBuilder.DropColumn(
                name: "OwnerFirstName",
                table: "Heads");

            migrationBuilder.DropColumn(
                name: "OwnerLastName",
                table: "Heads");

            migrationBuilder.DropColumn(
                name: "PartNumber",
                table: "Heads");

            migrationBuilder.DropColumn(
                name: "ServiceName",
                table: "Heads");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "Heads");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "MechanicId",
                table: "Logs",
                newName: "AssignedWorkerName");

            migrationBuilder.RenameColumn(
                name: "MechanicDisplayName",
                table: "Logs",
                newName: "AssignedWorkerId");

            migrationBuilder.RenameColumn(
                name: "HeadSummary",
                table: "Logs",
                newName: "HeadDescription");

            migrationBuilder.RenameColumn(
                name: "ServicePhoneNumber",
                table: "Heads",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "ServiceNeeds",
                table: "Heads",
                newName: "Actions");

            migrationBuilder.RenameColumn(
                name: "MechanicId",
                table: "Heads",
                newName: "AssignedWorkerId");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "Heads",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_Heads_MechanicId",
                table: "Heads",
                newName: "IX_Heads_AssignedWorkerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Heads_AspNetUsers_AssignedWorkerId",
                table: "Heads",
                column: "AssignedWorkerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
