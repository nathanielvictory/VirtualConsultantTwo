using AutoMapper;
using api.Dtos;
using api.Models;

namespace api.Mapping;

public class TaskProfile : Profile
{
    public TaskProfile()
    {
        // Enums map 1:1 by name
        CreateMap<TaskJob, TaskListItemDto>();
        CreateMap<TaskJob, TaskDetailDto>()
            .ForMember(d => d.Artifacts, opt => opt.MapFrom(s => s.Artifacts));

        CreateMap<TaskArtifact, TaskArtifactDto>();

        CreateMap<CreateTaskDto, TaskJob>()
            .ForMember(d => d.JobStatus, opt => opt.MapFrom(_ => TaskJobStatus.Queued))
            .ForMember(d => d.CreatedAt, opt => opt.Ignore())
            .ForMember(d => d.UpdatedAt, opt => opt.Ignore())
            .ForMember(d => d.StartedAt, opt => opt.Ignore())
            .ForMember(d => d.CompletedAt, opt => opt.Ignore());

        CreateMap<UpdateTaskDto, TaskJob>()
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember is not null));
    }
}