<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;

class AuditController extends Controller
{
    public function index()
    {
        return response()->json(
            AuditLog::with('user:id,name')
                ->orderBy('created_at', 'desc')
                ->take(100)
                ->get()
        );
    }
}
