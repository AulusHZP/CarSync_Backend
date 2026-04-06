# 📱 Flutter Integration Guide

Complete implementation guide for integrating CarSync backend Service Scheduling feature with Flutter app.

## 📋 Table of Contents

1. [Models & Enums](#models--enums)
2. [API Service](#api-service)
3. [Usage Examples](#usage-examples)
4. [Integration with UI](#integration-with-ui)
5. [Error Handling](#error-handling)

---

## 🏗️ Models & Enums

### 1. Service Model

Copy this into your Flutter app at `lib/models/service_model.dart`:

```dart
import 'package:intl/intl.dart';

enum ServiceStatus { completed, scheduled, upcoming }

extension ServiceStatusX on ServiceStatus {
  /// Get Portuguese display name
  String get displayName {
    switch (this) {
      case ServiceStatus.completed:
        return 'Concluído';
      case ServiceStatus.scheduled:
        return 'Agendado';
      case ServiceStatus.upcoming:
        return 'Em breve';
    }
  }

  /// Get API value
  String get apiValue {
    switch (this) {
      case ServiceStatus.completed:
        return 'COMPLETED';
      case ServiceStatus.scheduled:
        return 'SCHEDULED';
      case ServiceStatus.upcoming:
        return 'UPCOMING';
    }
  }

  /// Convert API value to enum
  static ServiceStatus fromApiValue(String value) {
    switch (value.toUpperCase()) {
      case 'COMPLETED':
        return ServiceStatus.completed;
      case 'SCHEDULED':
        return ServiceStatus.scheduled;
      case 'UPCOMING':
        return ServiceStatus.upcoming;
      default:
        throw ArgumentError('Unknown status: $value');
    }
  }
}

class Service {
  final String id;
  final String serviceType;
  final DateTime date;
  final String? notes;
  final ServiceStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  Service({
    required this.id,
    required this.serviceType,
    required this.date,
    this.notes,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Format date for display (e.g., "06 Abr 2026")
  String get formattedDate {
    return DateFormat('dd MMM yyyy', 'pt_BR').format(date);
  }

  /// Format full date-time (e.g., "06/04/2026 10:30")
  String get formattedDateTime {
    return DateFormat('dd/MM/yyyy HH:mm', 'pt_BR').format(date);
  }

  /// Check if service is in the coming 7 days
  bool get isUpcoming {
    final now = DateTime.now();
    final inSevenDays = now.add(const Duration(days: 7));
    return date.isAfter(now) && date.isBefore(inSevenDays);
  }

  /// JSON deserialization
  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['id'] as String,
      serviceType: json['serviceType'] as String,
      date: DateTime.parse(json['date'] as String),
      notes: json['notes'] as String?,
      status: ServiceStatusX.fromApiValue(json['status'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  /// JSON serialization
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'serviceType': serviceType,
      'date': date.toIso8601String(),
      'notes': notes,
      'status': status.apiValue,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Copy with
  Service copyWith({
    String? id,
    String? serviceType,
    DateTime? date,
    String? notes,
    ServiceStatus? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Service(
      id: id ?? this.id,
      serviceType: serviceType ?? this.serviceType,
      date: date ?? this.date,
      notes: notes ?? this.notes,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  String toString() => 'Service(id: $id, serviceType: $serviceType, status: $status)';
}

class ServiceResponse {
  final List<Service> data;
  final PaginationInfo pagination;
  final String message;

  ServiceResponse({
    required this.data,
    required this.pagination,
    required this.message,
  });

  factory ServiceResponse.fromJson(Map<String, dynamic> json) {
    final items = (json['data'] as List)
        .map((e) => Service.fromJson(e as Map<String, dynamic>))
        .toList();

    final paginationJson = json['pagination'] as Map<String, dynamic>;
    final pagination = PaginationInfo(
      page: paginationJson['page'] as int,
      limit: paginationJson['limit'] as int,
      total: paginationJson['total'] as int,
      pages: paginationJson['pages'] as int,
    );

    return ServiceResponse(
      data: items,
      pagination: pagination,
      message: json['message'] as String,
    );
  }
}

class PaginationInfo {
  final int page;
  final int limit;
  final int total;
  final int pages;

  PaginationInfo({
    required this.page,
    required this.limit,
    required this.total,
    required this.pages,
  });
}

class ServiceStats {
  final int total;
  final int completed;
  final int scheduled;
  final int upcoming;

  ServiceStats({
    required this.total,
    required this.completed,
    required this.scheduled,
    required this.upcoming,
  });

  factory ServiceStats.fromJson(Map<String, dynamic> json) {
    return ServiceStats(
      total: json['total'] as int,
      completed: json['completed'] as int,
      scheduled: json['scheduled'] as int,
      upcoming: json['upcoming'] as int,
    );
  }
}
```

---

## 🔌 API Service

Create `lib/services/service_api.dart`:

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/service_model.dart';

class ServiceApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  ServiceApiException({
    required this.message,
    this.statusCode,
    this.details,
  });

  @override
  String toString() => 'ServiceApiException: $message (Status: $statusCode)';
}

class ServiceApi {
  static const String baseUrl = 'http://localhost:3000/api';
  static const Duration timeout = Duration(seconds: 30);
  final http.Client _httpClient;

  ServiceApi({http.Client? httpClient})
      : _httpClient = httpClient ?? http.Client();

  /// Helper method for HTTP requests
  Future<dynamic> _request(
    String method,
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? queryParams,
  }) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint')
          .replace(queryParameters: queryParams?.cast<String, String>());

      final headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      http.Response response;

      switch (method.toUpperCase()) {
        case 'GET':
          response = await _httpClient
              .get(url, headers: headers)
              .timeout(timeout);
          break;
        case 'POST':
          response = await _httpClient
              .post(url, headers: headers, body: jsonEncode(body))
              .timeout(timeout);
          break;
        case 'PUT':
          response = await _httpClient
              .put(url, headers: headers, body: jsonEncode(body))
              .timeout(timeout);
          break;
        case 'PATCH':
          response = await _httpClient
              .patch(url, headers: headers, body: jsonEncode(body))
              .timeout(timeout);
          break;
        case 'DELETE':
          response = await _httpClient
              .delete(url, headers: headers)
              .timeout(timeout);
          break;
        default:
          throw ServiceApiException(message: 'Unknown HTTP method: $method');
      }

      if (response.statusCode >= 200 && response.statusCode < 300) {
        if (response.body.isEmpty) {
          return null;
        }
        return jsonDecode(response.body);
      } else {
        final errorBody = jsonDecode(response.body);
        throw ServiceApiException(
          message: errorBody['error'] ?? 'Unknown error',
          statusCode: response.statusCode,
          details: errorBody['details'],
        );
      }
    } on http.ClientException catch (e) {
      throw ServiceApiException(
        message: 'Network error: ${e.message}',
        details: e,
      );
    } on FormatException catch (e) {
      throw ServiceApiException(
        message: 'Invalid response format',
        details: e,
      );
    }
  }

  // =====================
  // Service Endpoints
  // =====================

  /// Create a new service
  Future<Service> createService({
    required String serviceType,
    required DateTime date,
    String? notes,
  }) async {
    final response = await _request(
      'POST',
      '/services',
      body: {
        'serviceType': serviceType,
        'date': date.toIso8601String(),
        if (notes != null && notes.isNotEmpty) 'notes': notes,
      },
    );

    return Service.fromJson(response['data']);
  }

  /// Get all services with pagination
  Future<ServiceResponse> getAllServices({
    int page = 1,
    int limit = 10,
    ServiceStatus? status,
  }) async {
    final queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (status != null) 'status': status.apiValue,
    };

    final response = await _request(
      'GET',
      '/services',
      queryParams: queryParams,
    );

    return ServiceResponse.fromJson(response);
  }

  /// Get a specific service by ID
  Future<Service> getServiceById(String id) async {
    final response = await _request('GET', '/services/$id');
    return Service.fromJson(response['data']);
  }

  /// Update service details
  Future<Service> updateService({
    required String id,
    String? serviceType,
    DateTime? date,
    String? notes,
  }) async {
    final body = <String, dynamic>{
      if (serviceType != null) 'serviceType': serviceType,
      if (date != null) 'date': date.toIso8601String(),
      if (notes != null) 'notes': notes,
    };

    final response = await _request(
      'PUT',
      '/services/$id',
      body: body,
    );

    return Service.fromJson(response['data']);
  }

  /// Update service status
  Future<Service> updateServiceStatus({
    required String id,
    required ServiceStatus status,
  }) async {
    final response = await _request(
      'PATCH',
      '/services/$id/status',
      body: {'status': status.apiValue},
    );

    return Service.fromJson(response['data']);
  }

  /// Delete a service
  Future<void> deleteService(String id) async {
    await _request('DELETE', '/services/$id');
  }

  /// Get upcoming services (next 7 days by default)
  Future<List<Service>> getUpcomingServices({int days = 7}) async {
    final response = await _request(
      'GET',
      '/services/upcoming/list',
      queryParams: {'days': days.toString()},
    );

    final items = (response['data'] as List)
        .map((e) => Service.fromJson(e as Map<String, dynamic>))
        .toList();

    return items;
  }

  /// Get service statistics
  Future<ServiceStats> getServiceStatistics() async {
    final response = await _request('GET', '/services/statistics/summary');
    return ServiceStats.fromJson(response['data']);
  }
}
```

---

## 💡 Usage Examples

### Example 1: Create Service

```dart
final serviceApi = ServiceApi();

try {
  final newService = await serviceApi.createService(
    serviceType: 'Troca de óleo',
    date: DateTime(2026, 4, 6),
    notes: 'Óleo sintético 5W-30',
  );
  
  print('Service created: ${newService.id}');
} on ServiceApiException catch (e) {
  print('API Error: ${e.message}');
} catch (e) {
  print('Error: $e');
}
```

### Example 2: Fetch and Display Services

```dart
final serviceApi = ServiceApi();

try {
  final response = await serviceApi.getAllServices(page: 1, limit: 10);
  
  for (final service in response.data) {
    print('${service.serviceType} - ${service.formattedDate}');
  }
} catch (e) {
  print('Error: $e');
}
```

### Example 3: Update Status

```dart
try {
  final updated = await serviceApi.updateServiceStatus(
    id: 'service-id-here',
    status: ServiceStatus.completed,
  );
  
  print('Status: ${updated.status.displayName}');
} catch (e) {
  print('Error: $e');
}
```

### Example 4: Delete Service

```dart
try {
  await serviceApi.deleteService('service-id-here');
  print('Service deleted');
} catch (e) {
  print('Error: $e');
}
```

---

## 🎨 Integration with UI

### ScheduleServiceScreen Integration

Update your `schedule_service_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/service_api.dart';
import '../models/service_model.dart';

class ScheduleServiceScreen extends StatefulWidget {
  const ScheduleServiceScreen({super.key});

  @override
  State<ScheduleServiceScreen> createState() => _ScheduleServiceScreenState();
}

class _ScheduleServiceScreenState extends State<ScheduleServiceScreen> {
  late TextEditingController serviceTypeController;
  late TextEditingController dateController;
  late TextEditingController descriptionController;
  final serviceApi = ServiceApi();
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    serviceTypeController = TextEditingController(text: 'Troca de óleo');
    dateController = TextEditingController(text: '06/04/2026');
    descriptionController = TextEditingController(text: '');
  }

  @override
  void dispose() {
    serviceTypeController.dispose();
    dateController.dispose();
    descriptionController.dispose();
    super.dispose();
  }

  Future<void> _scheduleService() async {
    if (serviceTypeController.text.isEmpty || dateController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Preencha todos os campos obrigatórios')),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      // Parse date (assuming DD/MM/YYYY format)
      final parts = dateController.text.split('/');
      final date = DateTime(
        int.parse(parts[2]),
        int.parse(parts[1]),
        int.parse(parts[0]),
      );

      // Create service via API
      final service = await serviceApi.createService(
        serviceType: serviceTypeController.text,
        date: date,
        notes: descriptionController.text.isNotEmpty ? descriptionController.text : null,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Serviço "${service.serviceType}" agendado com sucesso'),
            backgroundColor: Colors.green,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao agendar serviço: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // ... scaffold code ...
      floatingActionButton: ElevatedButton(
        onPressed: isLoading ? null : _scheduleService,
        child: isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Text('Confirmar Agendamento'),
      ),
    );
  }
}
```

### MaintenanceScreen Integration

Fetch services in your maintenance screen:

```dart
class MaintenanceScreen extends StatefulWidget {
  const MaintenanceScreen({super.key});

  @override
  State<MaintenanceScreen> createState() => _MaintenanceScreenState();
}

class _MaintenanceScreenState extends State<MaintenanceScreen> {
  final serviceApi = ServiceApi();
  late Future<ServiceResponse> futureServices;

  @override
  void initState() {
    super.initState();
    futureServices = serviceApi.getAllServices();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FutureBuilder<ServiceResponse>(
        future: futureServices,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (snapshot.hasData) {
            final services = snapshot.data!.data;
            return ListView.builder(
              itemCount: services.length,
              itemBuilder: (context, index) {
                final service = services[index];
                return ListTile(
                  title: Text(service.serviceType),
                  subtitle: Text(service.formattedDate),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: _getStatusColor(service.status).withOpacity(0.2),
                    ),
                    child: Text(
                      service.status.displayName,
                      style: TextStyle(
                        color: _getStatusColor(service.status),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                );
              },
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Color _getStatusColor(ServiceStatus status) {
    switch (status) {
      case ServiceStatus.completed:
        return Colors.green;
      case ServiceStatus.scheduled:
        return Colors.blue;
      case ServiceStatus.upcoming:
        return Colors.orange;
    }
  }
}
```

---

## ⚠️ Error Handling

```dart
try {
  final service = await serviceApi.getServiceById('invalid-id');
} on ServiceApiException catch (e) {
  if (e.statusCode == 404) {
    print('Service not found');
  } else if (e.statusCode == 400) {
    print('Validation error: ${e.details}');
  } else {
    print('API error: ${e.message}');
  }
} catch (e) {
  print('Unexpected error: $e');
}
```

---

## 📦 Dependencies

Add to `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  intl: ^0.18.0
```

Run:
```bash
flutter pub get
```

---

## ✅ Checklist

- [ ] Add `http` and `intl` to pubspec.yaml
- [ ] Create `service_model.dart` with all models
- [ ] Create `service_api.dart` with API client
- [ ] Update `baseUrl` for production
- [ ] Test endpoints with sample data
- [ ] Integrate with ScheduleServiceScreen
- [ ] Integrate with MaintenanceScreen
- [ ] Add error handling to all screens
- [ ] Set up state management (Provider/Riverpod)



```dart
class Expense {
  final String id;
  final String category;
  final String categoryLabel;
  final double amount;
  final DateTime createdAt;
  final DateTime updatedAt;

  Expense({
    required this.id,
    required this.category,
    required this.categoryLabel,
    required this.amount,
    required this.createdAt,
    required this.updatedAt,
  });

  // Convert JSON to Dart object
  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id'] as String,
      category: json['category'] as String,
      categoryLabel: json['categoryLabel'] as String,
      amount: (json['amount'] as num).toDouble(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  // Convert Dart object to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category': category,
      'categoryLabel': categoryLabel,
      'amount': amount,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Copy with for immutability
  Expense copyWith({
    String? id,
    String? category,
    String? categoryLabel,
    double? amount,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Expense(
      id: id ?? this.id,
      category: category ?? this.category,
      categoryLabel: categoryLabel ?? this.categoryLabel,
      amount: amount ?? this.amount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class CreateExpenseRequest {
  final String category;
  final double amount;

  CreateExpenseRequest({
    required this.category,
    required this.amount,
  });

  Map<String, dynamic> toJson() {
    return {
      'category': category,
      'amount': amount,
    };
  }
}

class UpdateExpenseRequest {
  final String? category;
  final double? amount;

  UpdateExpenseRequest({
    this.category,
    this.amount,
  });

  Map<String, dynamic> toJson() {
    return {
      if (category != null) 'category': category,
      if (amount != null) 'amount': amount,
    };
  }
}

class PaginatedExpensesResponse {
  final List<Expense> data;
  final PaginationInfo pagination;
  final String message;

  PaginatedExpensesResponse({
    required this.data,
    required this.pagination,
    required this.message,
  });

  factory PaginatedExpensesResponse.fromJson(Map<String, dynamic> json) {
    return PaginatedExpensesResponse(
      data: (json['data'] as List)
          .map((item) => Expense.fromJson(item as Map<String, dynamic>))
          .toList(),
      pagination: PaginationInfo.fromJson(
          json['pagination'] as Map<String, dynamic>),
      message: json['message'] as String,
    );
  }
}

class PaginationInfo {
  final int page;
  final int limit;
  final int total;
  final int pages;

  PaginationInfo({
    required this.page,
    required this.limit,
    required this.total,
    required this.pages,
  });

  factory PaginationInfo.fromJson(Map<String, dynamic> json) {
    return PaginationInfo(
      page: json['page'] as int,
      limit: json['limit'] as int,
      total: json['total'] as int,
      pages: json['pages'] as int,
    );
  }
}
```

## 🔧 Expense Service

Create `lib/services/expense_service.dart`:

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/expense.dart';

class ExpenseService {
  static const String baseUrl = 'http://localhost:3000/api';
  final http.Client httpClient;

  ExpenseService({http.Client? httpClient})
      : httpClient = httpClient ?? http.Client();

  /// Create a new expense
  Future<Expense> createExpense(String category, double amount) async {
    try {
      final response = await httpClient.post(
        Uri.parse('$baseUrl/expenses'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'category': category,
          'amount': amount,
        }),
      );

      if (response.statusCode == 201) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return Expense.fromJson(jsonData['data'] as Map<String, dynamic>);
      } else if (response.statusCode == 400) {
        final error = jsonDecode(response.body) as Map<String, dynamic>;
        throw Exception('Validation error: ${error['error']}');
      } else {
        throw Exception('Failed to create expense: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error creating expense: $e');
    }
  }

  /// Get all expenses with pagination
  Future<PaginatedExpensesResponse> getExpenses({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/expenses').replace(
        queryParameters: {
          'page': page.toString(),
          'limit': limit.toString(),
        },
      );

      final response = await httpClient.get(uri, headers: {
        'Content-Type': 'application/json',
      });

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return PaginatedExpensesResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to fetch expenses: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching expenses: $e');
    }
  }

  /// Get expense by ID
  Future<Expense> getExpenseById(String id) async {
    try {
      final response = await httpClient.get(
        Uri.parse('$baseUrl/expenses/$id'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return Expense.fromJson(jsonData['data'] as Map<String, dynamic>);
      } else if (response.statusCode == 404) {
        throw Exception('Expense not found');
      } else {
        throw Exception('Failed to fetch expense: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching expense: $e');
    }
  }

  /// Update an expense
  Future<Expense> updateExpense(String id, String? category, double? amount) async {
    try {
      final body = <String, dynamic>{};
      if (category != null) body['category'] = category;
      if (amount != null) body['amount'] = amount;

      final response = await httpClient.put(
        Uri.parse('$baseUrl/expenses/$id'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return Expense.fromJson(jsonData['data'] as Map<String, dynamic>);
      } else if (response.statusCode == 404) {
        throw Exception('Expense not found');
      } else if (response.statusCode == 400) {
        final error = jsonDecode(response.body) as Map<String, dynamic>;
        throw Exception('Validation error: ${error['error']}');
      } else {
        throw Exception('Failed to update expense: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error updating expense: $e');
    }
  }

  /// Delete an expense
  Future<void> deleteExpense(String id) async {
    try {
      final response = await httpClient.delete(
        Uri.parse('$baseUrl/expenses/$id'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 204) {
        return;
      } else if (response.statusCode == 404) {
        throw Exception('Expense not found');
      } else {
        throw Exception('Failed to delete expense: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error deleting expense: $e');
    }
  }
}
```

## 📲 Using the Service in Your App

Update your `Add Expense Screen`:

```dart
import 'package:flutter/material.dart';
import '../services/expense_service.dart';
import '../models/expense.dart';

class AddExpenseScreen extends StatefulWidget {
  final Function(String category, int amount) onAddExpense;

  const AddExpenseScreen({super.key, required this.onAddExpense});

  @override
  State<AddExpenseScreen> createState() => _AddExpenseScreenState();
}

class _AddExpenseScreenState extends State<AddExpenseScreen> {
  final expenseService = ExpenseService();
  bool isLoading = false;

  // ... existing code ...

  void _addExpense() async {
    final amount = int.tryParse(amountController.text.trim());

    if (selectedCategory == null || selectedCategory!.isEmpty || amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Preencha categoria e valor válido.')),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      // Convert category name to enum format
      final categoryEnum = _toCategoryEnum(selectedCategory!);
      
      // Call backend
      final expense = await expenseService.createExpense(
        categoryEnum,
        amount.toDouble(),
      );

      // Notify parent and close
      widget.onAddExpense(selectedCategory!, amount);
      Navigator.of(context).pop();
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${expense.categoryLabel} adicionado com sucesso.')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: ${e.toString()}')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  String _toCategoryEnum(String categoryLabel) {
    const Map<String, String> mapping = {
      'Combustível': 'FUEL',
      'Manutenção': 'MAINTENANCE',
      'Seguro': 'INSURANCE',
      'Lava-rápido': 'CAR_WASH',
      'Estacionamento': 'PARKING',
      'Pedágio': 'TOLL',
      'Outro': 'OTHER',
    };
    return mapping[categoryLabel] ?? 'OTHER';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // ... existing scaffold code ...
      floatingActionButton: ElevatedButton(
        onPressed: isLoading ? null : _addExpense,
        child: isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Text('Adicionar Gasto'),
      ),
    );
  }
}
```

## 🧪 Testing with Mock Service

For testing without a real backend:

```dart
// Create a mock implementation
class MockExpenseService extends ExpenseService {
  @override
  Future<Expense> createExpense(String category, double amount) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return Expense(
      id: 'mock-id-${DateTime.now().millisecondsSinceEpoch}',
      category: category,
      categoryLabel: category,
      amount: amount,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
  }

  // Mock other methods...
}

// Use in tests
testWidgets('Add expense test', (WidgetTester tester) async {
  // Replace ExpenseService with MockExpenseService
  // ...
});
```

## 🔌 Environment Configuration

Create `lib/config/app_config.dart`:

```dart
class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );
}
```

Build with different environments:

```bash
# Development
flutter run --dart-define API_BASE_URL=http://localhost:3000/api

# Production
flutter run --dart-define API_BASE_URL=https://api.carsync.com/api
```

## 📊 Usage Example in ExpensesScreen

```dart
class ExpensesScreen extends StatefulWidget {
  @override
  State<ExpensesScreen> createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends State<ExpensesScreen> {
  final expenseService = ExpenseService();
  List<Expense> expenses = [];
  int currentPage = 1;
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadExpenses();
  }

  Future<void> _loadExpenses() async {
    setState(() => isLoading = true);
    try {
      final response = await expenseService.getExpenses(
        page: currentPage,
        limit: 10,
      );
      setState(() => expenses = response.data);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: expenses.length,
              itemBuilder: (context, index) {
                final expense = expenses[index];
                return ListTile(
                  title: Text(expense.categoryLabel),
                  subtitle: Text('R\$ ${expense.amount.toStringAsFixed(2)}'),
                  trailing: Text(
                    expense.createdAt.toString(),
                  ),
                );
              },
            ),
    );
  }
}
```

## 🔐 Error Handling Examples

```dart
try {
  final expense = await expenseService.createExpense('FUEL', 85.50);
} on FormatException catch (e) {
  print('Format error: $e');
} on SocketException catch (e) {
  print('Network error: $e');
} catch (e) {
  print('Unexpected error: $e');
}
```

## 📚 Additional Resources

- [http package](https://pub.dev/packages/http)
- [Dio alternative](https://pub.dev/packages/dio) (more features)
- [Retrofit for type-safe requests](https://pub.dev/packages/retrofit)
