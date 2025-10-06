using AutoMapper;
using api.Dtos;
using api.Models;

namespace api.Mapping;

public class ProjectProfile : Profile
{
    public ProjectProfile()
    {
        CreateMap<Project, ProjectListItemDto>();
        CreateMap<Project, ProjectDetailDto>();
        CreateMap<CreateProjectDto, Project>();
        var upd = CreateMap<UpdateProjectDto, Project>();
        upd.ForAllMembers(opt =>
            opt.Condition((src, dest, srcMember) => srcMember is not null));
        
        upd.ForMember(dest => dest.IsActive,
            opt => opt.MapFrom((src, dest) => src.IsActive ?? dest.IsActive));
    }
}
