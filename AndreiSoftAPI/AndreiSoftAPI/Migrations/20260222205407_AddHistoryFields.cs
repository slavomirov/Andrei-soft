using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AndreiSoftAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddHistoryFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Action",
                table: "Logs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ChangedByDisplayName",
                table: "Logs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Logs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Logs",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Action",
                table: "Logs");

            migrationBuilder.DropColumn(
                name: "ChangedByDisplayName",
                table: "Logs");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Logs");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Logs");
        }
    }
}
