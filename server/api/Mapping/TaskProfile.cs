using AutoMapper;
using api.Dtos;
using api.Models;

namespace api.Mapping;

public class TaskProfile : Profile
{
    public TaskProfile()
    {
        // LIST ITEM: map ctor param "Status" from entity.JobStatus
        CreateMap<TaskJob, TaskListItemDto>()
            .ForCtorParam("Status", opt => opt.MapFrom(s => s.JobStatus));

        // DETAIL: also map ctor param "Status"
        CreateMap<TaskJob, TaskDetailDto>()
            .ForCtorParam("Status", opt => opt.MapFrom(s => s.JobStatus))
            .ForMember(d => d.Artifacts, opt => opt.MapFrom(s => s.Artifacts));

        CreateMap<TaskArtifact, TaskArtifactDto>();

        CreateMap<CreateTaskDto, TaskJob>()
            .ForMember(d => d.JobStatus,  opt => opt.MapFrom(_ => TaskJobStatus.Queued))
            .ForMember(d => d.CreatedAt,  opt => opt.Ignore())
            .ForMember(d => d.UpdatedAt,  opt => opt.Ignore())
            .ForMember(d => d.StartedAt,  opt => opt.Ignore())
            .ForMember(d => d.CompletedAt,opt => opt.Ignore());

        // UPDATE: fix name mismatches so patching Type/Status works
        CreateMap<UpdateTaskDto, TaskJob>()
            .ForMember(d => d.JobType,   opt => opt.MapFrom(s => s.Type))
            .ForMember(d => d.JobStatus, opt => opt.MapFrom(s => s.Status))
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember is not null));
    }
}