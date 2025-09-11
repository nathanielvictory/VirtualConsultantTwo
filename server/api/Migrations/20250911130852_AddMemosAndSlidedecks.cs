using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddMemosAndSlidedecks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "has_data",
                table: "projects");

            migrationBuilder.AddColumn<string>(
                name: "project_context",
                table: "projects",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "memos",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    doc_id = table.Column<string>(type: "text", nullable: true),
                    prompt_focus = table.Column<string>(type: "text", nullable: true),
                    project_id = table.Column<int>(type: "integer", nullable: false),
                    created_by_id = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_memos", x => x.id);
                    table.ForeignKey(
                        name: "fk_memos_projects_project_id",
                        column: x => x.project_id,
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_memos_users_created_by_id",
                        column: x => x.created_by_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "slidedecks",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    presentation_id = table.Column<string>(type: "text", nullable: true),
                    sheets_id = table.Column<string>(type: "text", nullable: true),
                    prompt_focus = table.Column<string>(type: "text", nullable: true),
                    project_id = table.Column<int>(type: "integer", nullable: false),
                    created_by_id = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_slidedecks", x => x.id);
                    table.ForeignKey(
                        name: "fk_slidedecks_projects_project_id",
                        column: x => x.project_id,
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_slidedecks_users_created_by_id",
                        column: x => x.created_by_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_memos_created_by_id",
                table: "memos",
                column: "created_by_id");

            migrationBuilder.CreateIndex(
                name: "ix_memos_project_id",
                table: "memos",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "ix_slidedecks_created_by_id",
                table: "slidedecks",
                column: "created_by_id");

            migrationBuilder.CreateIndex(
                name: "ix_slidedecks_project_id",
                table: "slidedecks",
                column: "project_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "memos");

            migrationBuilder.DropTable(
                name: "slidedecks");

            migrationBuilder.DropColumn(
                name: "project_context",
                table: "projects");

            migrationBuilder.AddColumn<bool>(
                name: "has_data",
                table: "projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
