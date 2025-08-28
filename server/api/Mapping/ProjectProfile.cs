// Mapping/ProjectProfile.cs
using AutoMapper;
using api.Dtos;
using api.Models;

namespace api.Mapping;

public class ProjectProfile : Profile
{
    public ProjectProfile()
    {
        // Entity -> DTOs
        CreateMap<Project, ProjectListItemDto>();
        CreateMap<Project, ProjectDetailDto>()
            .ForMember(d => d.Insights, opt => opt.MapFrom(src => src.Insights));

        // Create DTO -> Entity (inject defaults)
        CreateMap<CreateProjectDto, Project>()
            .ForMember(d => d.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(d => d.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        // Update DTO -> Entity (PATCH semantics: ignore nulls) + set UpdatedAt
        var upd = CreateMap<UpdateProjectDto, Project>();
        upd.ForAllMembers(opt =>
            opt.Condition((src, dest, srcMember) => srcMember is not null));
        upd.ForMember(d => d.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));
    }
}