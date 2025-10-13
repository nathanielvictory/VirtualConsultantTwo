using System.Linq.Expressions;
using api.Models;

namespace api.Auth.Permissions;

public static class PermissionPredicates
{
    /// <summary>
    /// Single source of truth: who can see a Project?
    /// Extend this as your rules grow (soft-deletes, flags, feature gates, etc.).
    /// </summary>
    public static Expression<Func<Project, bool>> CanSeeProject(int? currentUserId, bool isAdmin)
        => p => isAdmin ||
                (currentUserId != null &&
                 p.Organization.Memberships.Any(m => m.UserId == currentUserId));

    /// <summary>
    /// Rebinds a Project predicate onto a child entity that has a Project navigation,
    /// e.g., x => CanSeeProject(x.Project).
    /// Implemented via parameter substitution (no Expression.Invoke), so EF translates it.
    /// </summary>
    public static Expression<Func<TChild, bool>> Projecting<TChild>(
        Expression<Func<Project, bool>> projectPredicate,
        Expression<Func<TChild, Project>> childToProject)
    {
        var param = childToProject.Parameters[0];          // x
        var projectBody = childToProject.Body;             // x.Project

        // Replace all occurrences of the Project parameter in projectPredicate with x.Project
        var rebinder = new ReplaceParameterVisitor(projectPredicate.Parameters[0], projectBody);
        var newBody = rebinder.Visit(projectPredicate.Body)!;

        return Expression.Lambda<Func<TChild, bool>>(newBody, param);
    }

    private sealed class ReplaceParameterVisitor : ExpressionVisitor
    {
        private readonly ParameterExpression _from;
        private readonly Expression _to;

        public ReplaceParameterVisitor(ParameterExpression from, Expression to)
        {
            _from = from; _to = to;
        }

        protected override Expression VisitParameter(ParameterExpression node)
            => node == _from ? _to : base.VisitParameter(node);
    }
}