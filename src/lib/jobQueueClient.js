import { base44 } from '@/api/base44Client';

class JobQueueClient {
  async enqueue(jobType, payload, priority = 5) {
    try {
      const response = await base44.functions.invoke('jobQueue', {
        action: 'enqueue',
        job_type: jobType,
        payload,
        priority
      });
      return response.data.job_id;
    } catch (error) {
      console.error('Job enqueue error:', error);
      throw error;
    }
  }

  async getStatus(jobId) {
    try {
      const response = await base44.functions.invoke('jobQueue', {
        action: 'get_status',
        job_id: jobId
      });
      return response.data;
    } catch (error) {
      console.error('Job status error:', error);
      return null;
    }
  }

  async listUserJobs() {
    try {
      const response = await base44.functions.invoke('jobQueue', {
        action: 'list_user_jobs'
      });
      return response.data.jobs;
    } catch (error) {
      console.error('List jobs error:', error);
      return [];
    }
  }

  // Monitor job until completion
  async waitForCompletion(jobId, maxWaitMs = 300000, pollIntervalMs = 2000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const status = await this.getStatus(jobId);

      if (!status) {
        throw new Error('Job not found');
      }

      if (status.status === 'completed') {
        return status.result;
      }

      if (status.status === 'failed') {
        throw new Error(`Job failed: ${status.error}`);
      }

      if (status.status === 'cancelled') {
        throw new Error('Job was cancelled');
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(`Job did not complete within ${maxWaitMs}ms`);
  }
}

export const jobQueue = new JobQueueClient();