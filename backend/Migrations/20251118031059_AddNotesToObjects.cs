using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FantasyDomainManager.Migrations
{
    /// <inheritdoc />
    public partial class AddNotesToObjects : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Troops",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Heroes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Enterprises",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Domains",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Troops");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Heroes");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Enterprises");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Domains");
        }
    }
}
