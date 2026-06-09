import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, job_type, payload, priority = 5 } = await req.json();

    if (!action) {
      return Response.json({ error: 'action required' }, { status: 400 });
    }

    switch (action) {
      case 'enqueue': {
        if (!job_type || !payload) {
          return Response.json({ error: 'job_type and payload required' }, { status: 400 });
        }

        const job = await base44.asServiceRole.entities.BackgroundJob.create({
          job_type,
          user_email: user.email,
          payload,
          priority,
          status: 'queued'
        });

        return Response.json({ success: true, job_id: job.id });
      }

      case 'get_status': {
        const { job_id } = await req.json();
        if (!job_id) {
          return Response.json({ error: 'job_id required' }, { status: 400 });
        }

        const jobs = await base44.asServiceRole.entities.BackgroundJob.filter({ id: job_id });
        if (!jobs || jobs.length === 0) {
          return Response.json({ error: 'Job not found' }, { status: 404 });
        }

        const job = jobs[0];
        return Response.json({
          job_id: job.id,
          status: job.status,
          progress_percent: job.progress_percent,
          result: job.result,
          error: job.error_message
        });
      }

      case 'list_user_jobs': {
        const jobs = await base44.asServiceRole.entities.BackgroundJob.filter(
          { user_email: user.email },
          '-created_date',
          50
        );

        return Response.json({
          total: jobs.length,
          jobs: jobs.map(j => ({
            id: j.id,
            type: j.job_type,
            status: j.status,
            progress: j.progress_percent,
            created_at: j.created_date
          }))
        });
      }

      case 'next_job': {
        // Admin-only: get next job to process
        if (user.role !== 'admin' && user.custom_role !== 'super_admin') {
          return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const jobs = await base44.asServiceRole.entities.BackgroundJob.filter(
          { status: 'queued' },
          '-priority',
          1
        );

        if (!jobs || jobs.length === 0) {
          return Response.json({ job: null });
        }

        const job = jobs[0];
        await base44.asServiceRole.entities.BackgroundJob.update(job.id, {
          status: 'processing',
          started_at: new Date().toISOString()
        });

        return Response.json({ job });
      }

      case 'complete_job': {
        const { job_id, result } = await req.json();
        if (!job_id) {
          return Response.json({ error: 'job_id required' }, { status: 400 });
        }

        const job = await base44.asServiceRole.entities.BackgroundJob.update(job_id, {
          status: 'completed',
          result,
          completed_at: new Date().toISOString(),
          progress_percent: 100
        });

        return Response.json({ success: true });
      }

      case 'fail_job': {
        const { job_id, error_message } = await req.json();
        if (!job_id) {
          return Response.json({ error: 'job_id required' }, { status: 400 });
        }

        const jobs = await base44.asServiceRole.entities.BackgroundJob.filter({ id: job_id });
        if (!jobs || jobs.length === 0) {
          return Response.json({ error: 'Job not found' }, { status: 404 });
        }

        const job = jobs[0];
        const newRetryCount = (job.retry_count || 0) + 1;
        const shouldRetry = newRetryCount < (job.max_retries || 3);

        await base44.asServiceRole.entities.BackgroundJob.update(job.id, {
          status: shouldRetry ? 'queued' : 'failed',
          error_message,
          retry_count: newRetryCount,
          completed_at: shouldRetry ? null : new Date().toISOString()
        });

        return Response.json({
          success: true,
          retrying: shouldRetry,
          retry_count: newRetryCount
        });
      }

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});