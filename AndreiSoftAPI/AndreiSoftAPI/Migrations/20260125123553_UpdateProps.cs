using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AndreiSoftAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NewStatus",
                table: "Logs");

            migrationBuilder.RenameColumn(
                name: "OldStatus",
                table: "Logs",
                newName: "Status");

            migrationBuilder.AddColumn<string>(
                name: "AssignedWorkerId",
                table: "Logs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AssignedWorkerName",
                table: "Logs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeadDescription",
                table: "Logs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedWorkerId",
                table: "Logs");

            migrationBuilder.DropColumn(
                name: "AssignedWorkerName",
                table: "Logs");

            migrationBuilder.DropColumn(
                name: "HeadDescription",
                table: "Logs");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Logs",
                newName: "OldStatus");

            migrationBuilder.AddColumn<int>(
                name: "NewStatus",
                table: "Logs",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
