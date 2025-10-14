// api/Mapping/ProjectAccessProfile.cs
using AutoMapper;
using api.Dtos;
using api.Models;

namespace api.Mapping;

public class ProjectAccessProfile : Profile
{
    public ProjectAccessProfile()
    {
        CreateMap<ProjectAccess, ProjectAccessListItemDto>();
        CreateMap<CreateProjectAccessDto, ProjectAccess>();
    }
}