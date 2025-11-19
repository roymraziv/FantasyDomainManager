using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FantasyDomainManager.Migrations
{
    /// <inheritdoc />
    public partial class AddClassToHero : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Class",
                table: "Heroes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Class",
                table: "Heroes");
        }
    }
}
