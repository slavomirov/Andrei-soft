using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AndreiSoftAPI.Migrations
{
    /// <inheritdoc />
    public partial class DynamicServiceNeeds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ServiceNeeds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceNeeds", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ServiceNeeds",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "Price" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "Обработка на седла", 150m },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "Смяна на водачи", 200m },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "Шлифоване на повърхност", 120m },
                    { 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "Тест за пукнатини", 80m },
                    { 5, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "Почистване и измиване", 60m },
                    { 6, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "Тест на пружини", 50m },
                    { 7, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "Смяна на уплътнения", 90m },
                    { 8, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "Портинг и полиране", 300m },
                    { 9, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "Монтажни дейности", 180m },
                    { 10, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "Тест под налягане", 100m }
                });

            // Migrate existing Head CSV data from enum names to IDs
            var replacements = new (string enumName, string id)[]
            {
                ("ValveSeatMachining",      "1"),
                ("ValveGuidesReplacement",  "2"),
                ("SurfaceGrinding",         "3"),
                ("CrackTesting",            "4"),
                ("CleaningAndWashing",      "5"),
                ("SpringTesting",           "6"),
                ("SealReplacement",         "7"),
                ("PortingAndPolishing",     "8"),
                ("AssemblyWork",            "9"),
                ("PressureTesting",         "10"),
            };

            foreach (var (enumName, id) in replacements)
            {
                migrationBuilder.Sql(
                    $"UPDATE Heads SET ServiceNeeds = REPLACE(ServiceNeeds, '{enumName}', '{id}') WHERE ServiceNeeds LIKE '%{enumName}%'");
                migrationBuilder.Sql(
                    $"UPDATE Heads SET CheckedServiceNeeds = REPLACE(CheckedServiceNeeds, '{enumName}', '{id}') WHERE CheckedServiceNeeds LIKE '%{enumName}%'");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceNeeds");
        }
    }
}
