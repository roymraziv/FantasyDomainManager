using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FantasyDomainManager.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Domains",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Ruler = table.Column<string>(type: "TEXT", nullable: false),
                    Population = table.Column<int>(type: "INTEGER", nullable: false),
                    UpkeepCost = table.Column<int>(type: "INTEGER", nullable: true),
                    UpkeepCostLowerLimit = table.Column<int>(type: "INTEGER", nullable: true),
                    UpkeepCostUpperLimit = table.Column<int>(type: "INTEGER", nullable: true),
                    Income = table.Column<int>(type: "INTEGER", nullable: true),
                    IncomeLowerLimit = table.Column<int>(type: "INTEGER", nullable: true),
                    IncomeUpperLimit = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Domains", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Enterprises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Income = table.Column<int>(type: "INTEGER", nullable: true),
                    IncomeLowerLimit = table.Column<int>(type: "INTEGER", nullable: true),
                    IncomeUpperLimit = table.Column<int>(type: "INTEGER", nullable: true),
                    UpkeepCost = table.Column<int>(type: "INTEGER", nullable: true),
                    UpkeepCostLowerLimit = table.Column<int>(type: "INTEGER", nullable: true),
                    UpkeepCostUpperLimit = table.Column<int>(type: "INTEGER", nullable: true),
                    DomainId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Enterprises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Enterprises_Domains_DomainId",
                        column: x => x.DomainId,
                        principalTable: "Domains",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Heroes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false),
                    Level = table.Column<int>(type: "INTEGER", nullable: false),
                    Wage = table.Column<int>(type: "INTEGER", nullable: false),
                    DomainId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Heroes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Heroes_Domains_DomainId",
                        column: x => x.DomainId,
                        principalTable: "Domains",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Troops",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    Wage = table.Column<int>(type: "INTEGER", nullable: false),
                    DomainId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Troops", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Troops_Domains_DomainId",
                        column: x => x.DomainId,
                        principalTable: "Domains",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Enterprises_DomainId",
                table: "Enterprises",
                column: "DomainId");

            migrationBuilder.CreateIndex(
                name: "IX_Heroes_DomainId",
                table: "Heroes",
                column: "DomainId");

            migrationBuilder.CreateIndex(
                name: "IX_Troops_DomainId",
                table: "Troops",
                column: "DomainId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Enterprises");

            migrationBuilder.DropTable(
                name: "Heroes");

            migrationBuilder.DropTable(
                name: "Troops");

            migrationBuilder.DropTable(
                name: "Domains");
        }
    }
}
