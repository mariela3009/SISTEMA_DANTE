<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    /**
     * GET /api/clients
     */
    public function index(Request $request)
    {
        $query = Client::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('document_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('document_type')) {
            $query->where('document_type', $request->document_type);
        }

        $clients = $query->orderBy('name')->paginate(15);

        return response()->json($clients);
    }

    /**
     * POST /api/clients
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255|unique:clients,name',
            'document_type'   => 'required|in:dni,ruc',
            'document_number' => 'required|string|max:20|unique:clients,document_number',
            'email'           => 'nullable|email|max:255',
            'phone'           => 'nullable|string|max:20',
        ]);

        $client = Client::create($data);

        return response()->json($client, 201);
    }

    /**
     * GET /api/clients/{client}
     */
    public function show(Client $client)
    {
        return response()->json($client);
    }

    /**
     * PUT /api/clients/{client}
     */
    public function update(Request $request, Client $client)
    {
        $data = $request->validate([
            'name'            => ['sometimes', 'required', 'string', 'max:255', Rule::unique('clients', 'name')->ignore($client->id)],
            'document_type'   => 'sometimes|required|in:dni,ruc',
            'document_number' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('clients')->ignore($client->id),
            ],
            'email'           => 'nullable|email|max:255',
            'phone'           => 'nullable|string|max:20',
        ]);

        $client->update($data);

        return response()->json($client);
    }

    /**
     * DELETE /api/clients/{client}
     */
    public function destroy(Client $client)
    {
        // Verificar si el cliente tiene ventas asociadas
        if ($client->sales()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar el cliente porque tiene ventas históricas asociadas. Se recomienda mantenerlo registrado.'
            ], 422);
        }

        $client->delete();

        return response()->json(['message' => 'Cliente eliminado correctamente.'], 200);
    }
}
