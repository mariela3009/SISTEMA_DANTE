<?php

namespace App\Observers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditObserver
{
    public function created(Model $model)
    {
        $this->log($model, 'created', null, $model->getAttributes());
    }

    public function updated(Model $model)
    {
        $old = array_intersect_key($model->getOriginal(), $model->getDirty());
        $new = $model->getDirty();
        
        $this->log($model, 'updated', $old, $new);
    }

    public function deleted(Model $model)
    {
        $this->log($model, 'deleted', $model->getAttributes(), null);
    }

    protected function log(Model $model, string $action, ?array $old, ?array $new)
    {
        AuditLog::create([
            'user_id'    => auth()->id() ?? null,
            'action'     => $action,
            'table_name' => $model->getTable(),
            'record_id'  => $model->getKey(),
            'old_values' => $old,
            'new_values' => $new,
            'created_at' => now(),
        ]);
    }
}
