using AutoMapper;
using api.Dtos;
using api.Models;

namespace api.Mapping
{
    public class TaskProfile : Profile
    {
        public TaskProfile()
        {
            // Existing maps (unchanged)
            CreateMap<TaskJob, TaskListItemDto>()
                .ForCtorParam("Status", opt => opt.MapFrom(s => s.JobStatus));

            CreateMap<TaskJob, TaskDetailDto>()
                .ForCtorParam("Status", opt => opt.MapFrom(s => s.JobStatus))
                .ForMember(d => d.Artifacts, opt => opt.MapFrom(s => s.Artifacts));

            // Artifacts
            CreateMap<TaskArtifact, TaskArtifactDto>();

            CreateMap<CreateTaskArtifactDto, TaskArtifact>()
                .ForMember(d => d.Id,             opt => opt.Ignore())
                .ForMember(d => d.TaskId,         opt => opt.Ignore()) // from route
                .ForMember(d => d.Task,           opt => opt.Ignore())
                .ForMember(d => d.CreatedAt,      opt => opt.Ignore());

            CreateMap<UpdateTaskArtifactDto, TaskArtifact>()
                .ForAllMembers(opt =>
                    opt.Condition((src, dest, srcMember) => srcMember is not null));

            // Tasks create/update
            CreateMap<CreateTaskDto, TaskJob>()
                .ForMember(d => d.JobStatus,   opt => opt.MapFrom(_ => TaskJobStatus.Queued))
                .ForMember(d => d.CreatedAt,   opt => opt.Ignore())
                .ForMember(d => d.UpdatedAt,   opt => opt.Ignore())
                .ForMember(d => d.StartedAt,   opt => opt.Ignore())
                .ForMember(d => d.CompletedAt, opt => opt.Ignore());

            CreateMap<UpdateTaskDto, TaskJob>()
                .ForMember(d => d.JobType,   opt => opt.MapFrom(s => s.Type))
                .ForMember(d => d.JobStatus, opt => opt.MapFrom(s => s.Status))
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember is not null));
        }
    }
}